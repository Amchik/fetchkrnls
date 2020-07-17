#!/usr/bin/node
const http = require("https");
const jsdom = require("jsdom").JSDOM;

const resource = "https://www.kernel.org/";
//const resource = "http://localhost:2555/yes";
const format = "[{branch}]\t{version}  \t{date}";

function getElementList(node) {
    let arr = Array.from(node.childNodes);
    return arr.filter(x => x.nodeName != "#text");
}

function beginResult() {};
function endResult() {};

function printResult(branch, version, date) { 
    if (version.length < 12) {
        for (; version.length < 12; version += " ") {};
    }
    console.log(format.replace("{branch}", branch).replace("{version}", version).replace("{date}", date))
}

function parse(body) {
    let dom = new jsdom(body);
    let document = dom.window.document;
    let lines = getElementList(getElementList(document.getElementById("releases"))[0]);
    beginResult();
    lines.forEach(x => {
        let nodes = getElementList(x);

        let branch  = nodes[0].innerHTML.replace(":", "");
        let date    = nodes[2].innerHTML;
        let version = getElementList(nodes[1])[0].innerHTML.replace('<span class="eolkernel" title="This release is End-of-Life">[EOL]</span>', "[EOL]");
        printResult(branch, version, date);
    });
    endResult();
}

http.get(resource, (res) => {
    let body = "";
    if (res.statusCode != 200) {
        console.error(`Opps! Failed to make request to ${resource}: Server returns error status code (${res.statusCode}: ${res.statusMessage})`);
        return;
    }
    res.on('data', (chunk) => {
        body += chunk.toString();
    }).on('end', () => {
        parse(body);
    });
});
