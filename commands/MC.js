const fs = require("fs");
const chalk = require('chalk');
const mutate = require('./mutation.js');
const exec = require('child_process').execSync;


exports.command = 'MC <src_filename> <des_filename> <iterations>';
exports.desc = 'Run mutation coverage test';
exports.builder = yargs => {
    yargs.options({});
};

exports.handler = async argv => {
    const {src_filename, des_filename, iterations, urls} = argv;
    var total = 0;
    var failed = 0;
    var delta = [0,0,0,0];
    try{
        console.log(chalk.green(`Mutating js file ${src_filename}`));
        // TO DO: take screenshots of the unchanged urls
        // TO DO: resume to execution after catch
        for (i=0; i<iterations; i++){
            mutate.rewrite(src_filename, des_filename);
        
        try {
            await exec(`node index.js`);
        } catch (e) {
            failed+=1;
            console.log(`${chalk.inverse('FAILURE')}: Start service`);
        }
        try{
            //TO DO; for each automation
            await exec(`screenshot http://localhost:3000/survey/long.md long${i}`);
        }
        catch (e) {
            failed+=1
            console.log(`${chalk.inverse('FAILURE')}: Screenshot http://localhost:3000/survey/long.md`);
        }
        try {
            console.log(await exec(``, {stdio: 'pipe'}).toString());
        } catch (e) {
            console.log(`${chalk.inverse('FAILURE')}: Terminate service`);
        }
    }

    } catch (e) {
        console.log(`${e}`); 
    }
};