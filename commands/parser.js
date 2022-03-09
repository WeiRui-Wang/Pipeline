const yaml = require('js-yaml');
const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');

exports.command = 'parse <filename>';
exports.desc = 'Parse yaml file';
exports.builder = yargs => {
    yargs.options({});
};

exports.handler = async argv => {
    const {filename} = argv;
    try{
        console.log(chalk.green(`Parsing yaml file ${filename}`));

        const content = yaml.load(fs.readFileSync(`${filename}`, 'utf8'));

        function Parse(content){
            var result=[];
            
            if (content['setup']){
                var setups = content['setup'];


                for (let i=0; i<setups.length;i++){
                    let each = setups[i];
                    var arg = Object.keys(each)[0];
                    if (arg == 'APT'){
                        var vals = Object.values(each)[0];
                        for (let j=0; j<vals.length;j++){
                            let v = vals[j];
                            result.push(`sudo apt install ${v} -y`);
                        }
                    }
                    if (arg == 'URL'){
                        var vals = Object.values(each)[0];
                        for (let j=0; j<setups.length;j++){
                            let v = vals[j];
                            result.push(`curl ${v}`);
                        }
                    }
                    if (arg == 'CMD'){
                        var vals = Object.values(each)[0];
                        for (let j=0; j<vals.length;j++){
                            let v = vals[j];
                            result.push(`${v}`)};
                    }
                }
            }                
            if (content['jobs']){
                let jobs = content['jobs'];
                for (let i=0; i<jobs.length;i++){
                    
                    let each = jobs[i];
                    if (each['steps']){
                        let steps = each['steps'];
                        for (let k=0; k<steps.length;k++){
                            let s = steps[k]
                            let cmd = (s['run'])
                            result.push(`${cmd}`);
                        }
                    }
                }
            }
            console.log("done.")
            return result;
        }

        var res;
        res = Parse(content);

        var logger = fs.createWriteStream('log.sh', {
            flags: 'a'
          })
        console.log(res.length)
        for (i=0;i<res.length;i++){
            logger.write(`${res[i]}\n`);
        }
        logger.end(); 






    } catch (e) {
        console.log(`${e}`); 
    }
};