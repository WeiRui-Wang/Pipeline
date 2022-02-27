const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').exec;

// const VBoxManage = require('../lib/exec/VBoxManage');
// const sshExec = require('../lib/exec/ssh');

// let image_dir = path.basename('ubuntu-focal-20.04')
// let image = path.join(image_dir, 'box.ovf');
const { stderr, stdout, stdin } = require('process');

exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;
    // console.log(path)
    // exec('chmod +x commands/run.sh',(error, stdout, stderr) => {
    //
    //     console.log(error || stderr);
    //     console.log(stdout);
    // });
    exec('sh commands/run.sh',(error, stdout, stderr) => {

        console.log(error || stderr);
        console.log(stdout);
    });
    // await VBoxManage.execute("import", `"${image}" --vsys 0 --vmname config-server`);

};