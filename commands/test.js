const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').execSync;
const fs = require('fs')
const yaml = require('js-yaml');
const envfile = require('envfile')
const envFilePath = path.join(path.dirname(require.main.filename), '.env');


exports.command = 'test [jobName] [ymlFile]';
exports.desc = 'Test given job specification in YAML';
exports.builder = yargs => {
    yargs.options({});
};


exports.handler = async argv => {
    const {jobName, ymlFile} = argv;
    if (!jobName || !ymlFile) {
        console.log(chalk.inverse('parameter(s) missing: test [jobName] [ymlFile]'));
        return;
    }
    console.log(chalk.green(`Testing for ${jobName} with ${ymlFile}...`));
    let env = await envfile.parseFileSync(envFilePath);
    const ymlFilePath = path.join(path.dirname(require.main.filename), ymlFile);
    const envVar = await envfile.parseFileSync(envFilePath);
    let rebuilding = false;
    if (envVar.init != 'true') {
        console.log(`one or more items within build jobs list has led to inconsistency within build environment, rerun ${chalk.inverse('init')} and follow defined YAML standard in the document to resolve the issue`);
        return;
    }
    if (envVar[`${jobName}_rebuildable`] == 'true') {
        rebuilding = true;
    } else {
        console.log(`job has not been built, run ${chalk.inverse('build')} module and follow defined YAML standard in the document to build ${jobName} and rerun ${chalk.inverse('test')} module for testing`);
        return;
    }
    try {
        const doc = yaml.load(fs.readFileSync(ymlFilePath, 'utf8'));
        doc['jobs'].length;
        doc['setup'].length;
        if (doc['setup']['apt'] != undefined && !rebuilding && envVar[`rebuildable`] == 'false') {
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
                        if (step['config'] != undefined) {
                            const configFilePath = path.join(path.dirname(require.main.filename), 'bakerx.yml');
                            const configVar = await envfile.parseFileSync(configFilePath);
                            run = run.replaceAll(`$${step['config'].toString()}`, configVar[step['config'].toString()]);
                        }
                        if (rebuilding && (step['test'] == undefined)) {
                            continue;
                        }
                        if (step['flamegraph'] != undefined) {
                            console.log(`Setting up flame graph component...`);
                            await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "rm -rf ~/FlameGraph/ 2>&1"`, {stdio: 'inherit'});
                            await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "git clone https://github.com/brendangregg/FlameGraph 2>&1"`, {stdio: 'inherit'});
                            console.log(`${chalk.inverse('SUCCESS')}: Setting up testing component\n`);
                            try {
                                console.log(`Checking flame graph configuration...`);
                                step['flamegraph']['hertz'].length;
                                step['flamegraph']['delay'].length;
                                step['flamegraph']['filename'].length;
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "mkdir -p ~/assets 2>&1"`, {stdio: 'inherit'});
                                console.log(`Collecting flame graph perf data...`);
                                require('child_process').exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "sudo perf record -F ${step['flamegraph']['hertz']} -a -g -o ${step['flamegraph']['filename']}.out -- sleep ${step['flamegraph']['delay']}"`);
                                console.log(`Running: ${step['name']}...`);
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "${run} 2>&1"`, {stdio: 'inherit'});
                                console.log(`${chalk.inverse('SUCCESS')}: ${step['name']}\n`);
                                console.log(`Generating flame graph...`);
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "sudo chown vagrant:vagrant ${step['flamegraph']['filename']}.out 2>&1"`, {stdio: 'inherit'});
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "perf script -i ${step['flamegraph']['filename']}.out | ~/FlameGraph/stackcollapse-perf.pl > ${step['flamegraph']['filename']}.perf-folded 2>&1"`, {stdio: 'inherit'});
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "~/FlameGraph/flamegraph.pl ${step['flamegraph']['filename']}.perf-folded > ~/assets/${step['flamegraph']['filename']}.svg 2>&1"`, {stdio: 'inherit'});
                                await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -fr assets/ /bakerx/ 2>&1"`, {stdio: 'inherit'});
                                console.log(`${chalk.inverse('SUCCESS')}: flame graph saved in both root of host and home of VM as /assets/${step['flamegraph']['filename']}.svg\n`);
                            } catch (e) {
                                console.log(`${chalk.inverse('FAILURE')}: invalid flame graph parameter or configuration defined in YAML\n`);
                            }
                        } else {
                            console.log(`Running: ${step['name']}...`);
                            await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "${run} 2>&1"`, {stdio: 'inherit'});
                            console.log(`${chalk.inverse('SUCCESS')}: ${step['name']}\n`);
                        }
                    } catch (e) {
                        if (!rebuilding && !envVar[`${jobName}_rebuildable`]) {
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
                    item['mutation']['microservice'].length;
                    item['mutation']['renderer'].length;
                    item['mutation']['driver'].length;
                    const iterations = await item['mutation']['iterations'];
                    let passed = 0;
                    let fails = 0;
                    let i = 0;
                    while (i <= iterations) {
                        let failed = true;
                        try {
                            try {
                                if (i == 0) {
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "mkdir -p .mutations/${item['mutation']['renderer']}"`, {stdio: 'pipe'});
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -rf ./${item['mutation']['microservice']}/${item['mutation']['renderer']} .mutations/${item['mutation']['renderer']}/baseline.js"`, {stdio: 'pipe'});
                                } else {
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -fr .mutations/${item['mutation']['renderer']}/baseline.js ./${item['mutation']['microservice']}/${item['mutation']['renderer']}"`, {stdio: 'pipe'});
                                    console.log(`\nMutating microservice renderer`);
                                    console.log(await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "node ${item['mutation']['driver']} ./${item['mutation']['microservice']}/${item['mutation']['renderer']} ./${item['mutation']['microservice']}/${item['mutation']['renderer']} 2>&1"`, {stdio: 'pipe'}).toString());
                                }
                            } catch (e) {
                                envVar.init = false;
                                fs.writeFileSync(envFilePath, envfile.stringifySync(envVar));
                                console.log(chalk.inverse(`please ensure steps and mutation components identified from '${jobName}' of ${ymlFile} are present and valid`));
                                return;
                            }
                            require('child_process').exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cd ${item['mutation']['microservice']}/ && node index.js"`);
                            for await (const snapshot of item['mutation']['snapshots']) {
                                if (i == 0) {
                                    console.log(`Generating initial baseline snapshot of ${snapshot.split('/').pop()}`);
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null 'mkdir -p .mutations/${snapshot.split('/').pop()}'`, {stdio: 'pipe'});
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "curl ${snapshot} --retry-connrefused --retry 2 > .mutations/${snapshot.split('/').pop()}/baseline.html"`, {stdio: 'pipe'});
                                } else {
                                    console.log(`Generating snapshot of ${snapshot.split('/').pop()}`);
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "curl ${snapshot} --retry-connrefused --retry 2 > .mutations/${snapshot.split('/').pop()}/${i}.html"`, {stdio: 'pipe'});
                                }
                            }
                            failed = true;
                            await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "pkill -f node"`, {stdio: 'pipe'});
                        } catch (e) {
                            console.log(chalk.red("Error for mutant occurred.\nCurrent iteration result and run was excluded from the calculation.\n"));
                            console.log(`passed: ${chalk.green(passed)}, fails: ${chalk.red(fails)}\n`);
                            continue;
                        }
                        if (i >= 1) {
                            await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -fr ./${item['mutation']['microservice']}/${item['mutation']['renderer']} .mutations/${item['mutation']['renderer']}/${i}.js"`, {stdio: 'pipe'});
                            try {
                                for await (const snapshot of item['mutation']['snapshots']) {
                                    console.log(`Comparing ${snapshot.split('/').pop()}/${i} with ${snapshot.split('/').pop()}/baseline`);
                                    await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "diff .mutations/${snapshot.split('/').pop()}/baseline.html .mutations/${snapshot.split('/').pop()}/${i}.html"`, {stdio: 'pipe'});
                                }
                                console.log("No difference found for rendered results of current mutation iteration.\nCurrent mutation passed.");
                                failed = false;
                            } catch (e) {
                                console.log(e.stdout.toString());
                                console.log("Differences were found for one or more rendered test suites of current mutation iteration.\n");
                                failed = true;
                            }
                        } else {
                            i++;
                            continue;
                        }
                        i++;
                        !failed ? passed++ : fails++;
                        console.log(`passed: ${chalk.green(passed)}, fails: ${chalk.red(fails)}\n`);
                    }
                    try {
                        await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -fr .mutations/${item['mutation']['renderer']}/baseline.js ./${item['mutation']['microservice']}/${item['mutation']['renderer']}"`, {stdio: 'pipe'});
                        await exec(`${env.CONNECTION_INFORMATION} -o UserKnownHostsFile=/dev/null "cp -fr .mutations/ /bakerx/"`, {stdio: 'pipe'});
                        console.log(`mutated drivers and rendered results can be found in ./mutations folder`);
                    } catch (e) {
                        console.log(`mutated drivers and rendered results can be found in ./mutations within the virtual machine`);
                    }
                    let mutationCoverage = ((fails / (fails + passed)) * 100).toFixed(2);
                    console.log(`mutation coverage: ${mutationCoverage}% [${fails}/${fails + passed}]\n`);
                }
                return;
            }
        }
        throw ``;
    } catch (e) {
        console.log(chalk.inverse(`please ensure all external resources '${ymlFile}', '${ymlFilePath}' or job specification '${jobName}' exists and valid`));
    }
};