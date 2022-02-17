/** @param {NS} ns **/
var ns;

const home = "home";
const buffer = 12;

const thisScript = "/scripts/management.js";

const hacknetManager = "/scripts/auto/hacknet-manager.js";
const serverManager = "/scripts/auto/server-manager.js";
const characterManager = "/scripts/auto/character-manage.js";
const stockManager = "/scripts/auto/stock-manager.js";

const moneyMaker = "/scripts/auto/localhack.js";

export async function main(_ns) {
	ns = _ns;
	var reset = ns.args[0] || false;
	var threads = ns.args[1] || 0;
	var target = ns.args[2] || "n00dles";
	
	if(await ns.getHostname() != home) ns.exit();
	if(reset != false) reset = true;

	if(ns.getHostname(home).maxRam < buffer) {
		ns.toast("management.js: minimum RAM requirements not met, minimum is: " + buffer + "GB","error",null);
		ns.exit();
	}

	if(reset) {
		let allScripts = await ns.ps(home);
		for(let script in allScripts) {
			if(allScripts[script].filename != thisScript) {
				await ns.kill(allScripts[script].pid);
			}
		}

		if(ns.fileExists(hacknetManager)) await ns.run(hacknetManager);
		if(ns.fileExists(serverManager)) await ns.run(serverManager);
		if(ns.fileExists(characterManager)) await ns.run(characterManager);
		if(ns.fileExists(stockManager)) await ns.run(stockManager);
	}

	if(threads > 0) {
		let pid = await ns.run(moneyMaker,threads,target);
		if(pid == 0) ns.toast("management.js: failed to start /script/auto/localhack.js with " + threads + " threads targetting " + target,"error",null);
	}
	else {
		threads = Math.floor((await ns.getServerMaxRam(home) - await ns.getServerUsedRam(home) - buffer) / await ns.getScriptRam(moneyMaker));
		let pid = await ns.run(moneyMaker,threads,target);
		if(pid == 0) ns.toast("management.js: failed to start /script/auto/localhack.js with " + threads + " auto calculated threads while targetting " + target,"error",null);
	}
}