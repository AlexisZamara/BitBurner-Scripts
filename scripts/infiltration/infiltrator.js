/** @param {NS} ns **/
var ns;
const doc = eval("document");
const minigames = ["Close the brackets","Slash when his guard is down!","Type it backward","Say something nice about the guard.","Enter the Code!","Match the symbols!","Mark all the mines!","Cut the wires with the following properties! (keyboard 1 to 9)"]
var results = [];

export function isInfiltrating() {
	for(let p of doc.querySelectorAll("p")) {
		let propKey = Object.keys(p)[1];
		if(!propKey) continue;
		let props = p[propKey];
		if(props?.children && props.children.length == 4 && props.children[0] == "Level: " && props.children[1] <= props.children[3]) return true;
	}
	return false;
}

export function whichGame() {
	for(let h4 of doc.querySelectorAll("h4")) {
		let propKey = Object.keys(h4)[1];
		if(!propKey) continue;
		let props = h4[propKey];
		if(props?.children && minigames.includes(props.children)) return true;
	}
}

export function findSuccess() {
	for(let div of doc.querySelectorAll("div.MuiGrid-spacing-xs-3")) {
		let propKey = Object.keys(div)[0];
		for(let prop in div[propKey]) {
			if(prop == "pendingProps") {
				for(let child in div[propKey][prop]) {
					if(child == "children") {
						for(let subprops in div[propKey][prop][child]) {
							recursiveSearch(div[propKey][prop][child][subprops],"onSuccess");
						}
					}
				}
			}
		}
	}
	if(results.length == 0) return false;
	return results[results.length-1];
}

function recursiveSearch(divProps,target) {
	if(typeof divProps == "string") return;
	for(let prop in divProps) {
		if(typeof divProps[prop] == "function" && prop == target) {
			results.push(divProps[prop]);
		}
		recursiveSearch(divProps[prop],target);
	}
}