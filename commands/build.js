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
        if (doc['setup']['apt'] != undefined) {
            for await (const item of doc['setup']['apt']) {
                process.stdout.write(`Installing ${item}...`);
                try {
                    await exec(`${env.CONNECTION_INFORMATION} 'sudo apt install ${item} -y 2>&1'`);
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    console.log(`${chalk.inverse('SUCCESS')}: apt install ${item}`);
                } catch (e) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    console.log(`${chalk.inverse('FAILURE')}: apt install ${item}`);
                }
            }
        }
        for await (const item of doc['jobs']) {
            if (item['name'] === jobName) {
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
                        }
                        if (rebuilding && step['rebuild'] == undefined) {
                            continue;
                        }
                        console.log(`Running: ${step['name']}...`);
                        console.log(await exec(`${env.CONNECTION_INFORMATION} '${run} 2>&1'`, {stdio: 'pipe'}).toString());
                        console.log(`${chalk.inverse('SUCCESS')}: ${step['name']}\n`);
                    } catch (e) {
                        if (!rebuilding) {
                            envVar.init = false;
                        }
                        console.log(e.stdout.toString());
                        console.log(`${chalk.inverse('FAILURE')}: ${step['name']}\n`);
                        break;
                    }
                }
                break;
            }
            throw ``;
        }
    } catch (e) {
        console.log(chalk.inverse(`error while parsing ${buildYml}, ${ymlFilePath} must exist and valid.`));
    }
    fs.writeFileSync(envFilePath, envfile.stringifySync(envVar));
};