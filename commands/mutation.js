const esprima = require("esprima");
const escodegen = require("escodegen");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');
const exec = require('child_process').execSync;
const util = require('util');
const { promisify } = require('util');
const exec1 = promisify(require('child_process').exec);

let operations = [NegateConditionals, ChangeBoundary, FlipIncremental, EmptyString, ChangeConExp, ChangeConst,EarlyReturn]

 function rewrite(filepath, newPath) {

var buf = fs.readFileSync(filepath, "utf8");
    var ast = esprima.parse(buf, options);    
    let ind = getRandomInt(operations.length+1)
    ind = 6
    if (ind<6){
        let op = operations[ind];
        op(ast);
        let code = escodegen.generate(ast);
        fs.writeFileSync( newPath, code);
    }
    // else if (ind==7){
    //     await ChangeFlow(filepath,newPath);
    // }
    else if (ind==6){
        EarlyReturn(ast,filepath,newPath);
    }
        
    
}
exports.rewrite = rewrite;

function NegateConditionals(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && (node.operator === ">" || 
        node.operator === "<" || node.operator === "==" || node.operator === "!=")  ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && node.operator === ">" ) {
            if( current === mutateTarget ) {
                node.operator = "<"
                console.log( chalk.red(`Replacing > with < on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "BinaryExpression" && node.operator === "<" ){
            if( current === mutateTarget ) {
                node.operator = ">"
                console.log( chalk.red(`Replacing < with > on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "BinaryExpression" && node.operator === "==" ){
            if( current === mutateTarget ) {
                node.operator = "!="
                console.log( chalk.red(`Replacing == with != on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "BinaryExpression" && node.operator === "!=" ){
            if( current === mutateTarget ) {
                node.operator = "=="
                console.log( chalk.red(`Replacing != with == on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })

}

function FlipIncremental(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" && (node.operator === "++" || node.operator === "--") ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" && node.operator === "++" ) {
            if( current === mutateTarget ) {
                node.operator = "--"
                console.log( chalk.red(`Replacing ++ with -- on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "UpdateExpression" && node.operator === "--" ){
            if( current === mutateTarget ) {
                node.operator = "++"
                console.log( chalk.red(`Replacing -- with ++ on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })
}

function ChangeBoundary(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && (node.operator === ">" || node.operator === "<") ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && node.operator === ">" ) {
            if( current === mutateTarget ) {
                node.operator = ">="
                console.log( chalk.red(`Replacing > with >= on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "BinaryExpression" && node.operator === "<" ){
            if( current === mutateTarget ) {
                node.operator = "<="
                console.log( chalk.red(`Replacing < with <= on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })

}


function ChangeConExp(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "LogicalExpression" && (node.operator === "&&" || node.operator === "||") ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "LogicalExpression" && node.operator === "&&" ) {
            if( current === mutateTarget ) {
                node.operator = "||"
                console.log( chalk.red(`Replacing && with || on line ${node.loc.start.line}` ));
            }
            current++;
        }
        else if( node.type === "LogicalExpression" && node.operator === "||" ){
            if( current === mutateTarget ) {
                node.operator = "&&"
                console.log( chalk.red(`Replacing || with && on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })

}

function EmptyString(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && node.raw === "\'\'" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && node.raw === "\'\'" ) {
            if( current === mutateTarget ) {
                node.value = "<div>Bug</div>"
                node.raw =  "\"<div>Bug</div>\""
                console.log( chalk.red(`Replacing empty string with <div>Bug</div> on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })

}

function ChangeConst(ast) {

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && typeof node.value == "number" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && typeof node.value == "number") {
            if( current === mutateTarget ) {
                node.value = node.value+1
                node.raw = String(node.value)
                console.log( chalk.red(`Increment the constant by 1 on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })
}



async function ChangeFlow(filepath,newPath) {
    const number  = await exec("grep -o 'else if' marqdown.js | wc -l")
    let i = getRandomInt(number)+1;
    await exec(`sed 's/else if/if/${i}' ${filepath} > ${newPath}`);
    console.log( chalk.red(`Change the No.${i} occurence of else if into if.` ));
}


async function EarlyReturn(ast,filepath,newPath){
    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "ReturnStatement") {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    var start,end, loc
    traverseWithParents(ast, (node) => {
        if( node.type === "ReturnStatement") {
            if( current === mutateTarget ) {
                start = node.loc.start.line
                end = node.loc.end.line
                loc = node.range
                console.log(node.loc.start.line, node.loc.end.line);
            }
            current++;
        }
    })

    
    var minimum = start
    traverseWithParents(ast, (node) => {
        if (node.hasOwnProperty("range")){
            if( node.range[0]<=loc[0] && node.range[1]>=loc[1] ) {
                if (node.loc.start.line<minimum && node.loc.start.line!=1 ){
                    minimum = node.loc.start.line
                };
                current++;
            }
        }
        
    }
    )
    const insert_ind = minimum+getRandomInt(start-minimum)
    // let exec_prom = util.promisify(exec)
    // let text = exec(`head -${end} ${filepath} | tail +${start}`);
    await exec1(`head -${end} ${filepath} | tail +${start}`, async function(error, stdout, stderr){
        var text = String(stdout);
        console.log(insert_ind,text);
        var data = fs.readFileSync(filepath).toString().split("\n");
        data.splice(insert_ind, 0, text);
        var text = data.join("\n");
        fs.writeFile(newPath, text, function (err) {
            if (err) return console.log(err);
          });
        // console.log(`sed '${insert_ind} i ${text}' ${filepath} > ${newPath}`);
        // console.log(await exec(`sed '${insert_ind} i ${text}' ${filepath} | tee ${newPath} `).toString())
    });
    console.log("ddd")
    // await exec(`sed '${insert_ind} i ${text}' ${filepath} > ${newPath}`);
    // console.log(`sed '${insert_ind} i ${text}' ${filepath} > ${newPath}`)
};

var arg = process.argv.slice(2);
rewrite(arg[0],arg[1]);


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}