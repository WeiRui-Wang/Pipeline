const esprima = require("esprima");
const escodegen = require("escodegen");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');
const exec = require('child_process').execSync;
const { promisify } = require('util');


let operations = [NegateConditionals, ChangeBoundary, FlipIncremental, EmptyString, ChangeConExp, ChangeConst]

async function rewrite(filepath, newPath) {

    var buf = fs.readFileSync(filepath, "utf8");
    var ast = esprima.parse(buf, options);    
    let ind = getRandomInt(operations.length+1)
    if (ind!=operations.length){
        let op = operations[ind];
        op(ast);
        let code = escodegen.generate(ast);
        fs.writeFileSync( newPath, code);
    }
    else{
        await ChangeFlow(filepath,newPath)
    }
    
}

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

var arg = process.argv.slice(2);
rewrite(arg[0],arg[1]);
// rewrite("/Users/cjparnin/classes/devops/checkbox.io-micro-preview/marqdown.js", 
// "/Users/cjparnin/classes/devops/checkbox.io-micro-preview/marqdown-mod.js")


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