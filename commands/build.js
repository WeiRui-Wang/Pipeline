const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').exec;
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
        console.log(chalk.bgRed('parameter(s) missing: build [jobName] [buildYml]'));
        return;
    }
    console.log(chalk.green(`Building environment for ${jobName} with ${buildYml}...`));
    let env = envfile.parseFileSync(envFilePath);
    const ymlFilePath = path.join(path.dirname(require.main.filename), buildYml);
    try {
        const doc = yaml.load(fs.readFileSync(ymlFilePath, 'utf8'));
        // console.log(doc);
    } catch (e) {
        console.log(chalk.bgRed(`error while loading ${buildYml}, make sure file ${ymlFilePath} exist and valid.`));
    }

    // console.log(env);
    // console.log(env.init === 'true');
    // await exec('sh commands/init.sh', (error, stdout) => {
    //     console.log(stdout);
    //     let env = envfile.parseFileSync(envFilePath);
    //     env.CONNECTION_INFORMATION = stdout.replace(/[\n]$/, '');
    //     fs.writeFileSync(envFilePath, envfile.stringifySync(env));
    // })
};