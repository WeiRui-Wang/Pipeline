const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs')
const envfile = require('envfile')
const envFilePath = path.join(path.dirname(require.main.filename), '.env');


exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({});
};


exports.handler = async argv => {
    const {} = argv;
    console.log(chalk.green("Preparing computing environment..."));
    await exec('sh commands/init.sh', (error, stdout) => {
        console.log(stdout);
        let env = envfile.parseFileSync(envFilePath);
        env.CONNECTION_INFORMATION = stdout.replace(/[\n]$/, '');
        env.init = true;
        fs.writeFileSync(envFilePath, envfile.stringifySync(env));
    })
};