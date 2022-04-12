const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').execSync;
const fs = require('fs')
const yaml = require('js-yaml');
const envfile = require('envfile')
const envFilePath = path.join(path.dirname(require.main.filename), '.env');


exports.command = 'build [jobName] [buildYml]';
exports.desc = 'Build environment for given build job specification in YAML';
exports.builder = yargs => {
    yargs.options({});
};


exports.handler = async argv => {
    const {jobName, buildYml} = argv;
    if (!jobName || !buildYml) {
        console.log(chalk.inverse('parameter(s) missing: build [jobName] [buildYml]'));
        return;
    }
    console.log(chalk.green(`Building environment for ${jobName} with ${buildYml}...`));
    let env = envfile.parseFileSync(envFilePath);
    const ymlFilePath = path.join(path.dirname(require.main.filename), buildYml);
    const envVar = envfile.parseFileSync(envFilePath);
    let rebuilding = false;
    if (envVar.init != 'true') {
        console.log(`one or more items within build jobs list has led to inconsistency within build environment, rerun ${chalk.inverse('init')} and follow defined YAML standard in the document to resolve the issue`);
        return;
    }
    if (envVar.rebuildable == 'true') {
        rebuilding = true;
    }
    try {
        const doc = yaml.load(fs.readFileSync(ymlFilePath, 'utf8'));
        doc['jobs'].length;
        doc['setup'].length;
        if (doc['setup']['apt'] != undefined && !rebuilding) {
            for await (const item of doc['setup']['apt']) {
                console.log(`Installing ${item}...`);
                try {
                    console.log(await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null 'sudo apt install ${item} -y 2>&1'`, {stdio: 'pipe'}).toString());
                    console.log(`${chalk.inverse('SUCCESS')}: apt install ${item}\n`);
                } catch (e) {
                    console.log(`${chalk.inverse('FAILURE')}: apt install ${item}\n`);
                }
            }
        }

        if (doc['setup']['url'] != undefined && !rebuilding) {
            for await (const item of doc['setup']['url']) {
                console.log(`Downloading via url: ${item}...`);
                try {
                    console.log(await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null 'sudo curl ${item} 2>&1'`, {stdio: 'pipe'}).toString());
                    console.log(`${chalk.inverse('SUCCESS')}: curl ${item}\n`);
                } catch (e) {
                    console.log(`${chalk.inverse('FAILURE')}: curl ${item}\n`);
                }
            }
        }


        for await (const item of doc['jobs']) {
            if (item['name'] === jobName) {
                if (envVar.rebuildable == 'true' && (envVar.built === undefined || envVar.built != jobName)) {
                    rebuilding = false;
                    envVar.built = jobName;
                    envVar.rebuildable = false;
                    fs.writeFileSync(envFilePath, envfile.stringifySync(envVar));
                }
                item['steps'].length;
                for await (const step of item['steps']) {
                    step['name'].length;
                    step['run'].length;
                    try {
                        let run = step['run'];
                        if (step['env'] != undefined) {
                            for await (const env of step['env']) {
                                run = run.replaceAll(`$${env.toString()}`, envVar[env]);
                            }
                        }
                        if (step['rebuild'] != undefined) {
                            envVar.rebuildable = true;
                            fs.writeFileSync(envFilePath, envfile.stringifySync(envVar));
                        }
                        if (rebuilding && (step['rebuild'] == undefined || step['rebuild'] == false)) {
                            continue;
                        }
                        console.log(`Running: ${step['name']}...`);
                        await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "${run} 2>&1"`, {stdio: 'inherit'});
                        console.log(`${chalk.inverse('SUCCESS')}: ${step['name']}\n`);
                    } catch (e) {
                        if (!rebuilding && !envVar.rebuildable) {
                            envVar.init = false;
                            fs.writeFileSync(envFilePath, envfile.stringifySync(envVar));
                        }
                        console.log(`${chalk.inverse('FAILURE')}: ${step['name']}\n`);
                        break;
                    }
                }
                if (typeof item['mutation'] !== "undefined") {
                    item['mutation']['iterations'].length;
                    item['mutation']['snapshots'].length;
                    const iterations = await item['mutation']['iterations'];
                    for await (const snapshot of item['mutation']['snapshots']) {
                        console.log(`${snapshot.split('/').pop()}`);
                        for (let i = 1; i <= iterations; i++) {
                        }
                    }
                    // console.log(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null 'git clone 2>&1'`);
                    // console.log(await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null 'git clone ${url} 2>&1'`, {stdio: 'pipe'}).toString());
                    // console.log(iterations);
                }
                break;
            }
            throw ``;
        }
    } catch (e) {
        console.log(chalk.inverse(`please ensure all external resources '${buildYml}', '${ymlFilePath}' or build job '${jobName}' exists and valid`));
    }
};