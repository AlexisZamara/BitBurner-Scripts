/** @param {NS} ns **/
var ns;

var files = ["/scripts/autohack.js"];
var serverFiles = ["/scripts/remote-hack-boost.js"];
var hackList = "hacked-targets.txt";

var home = "home";
var managementFile = "/scripts/management.js";

var scpRegex = /\.lit$/gmu;
var copyToServer = "home";

export async function main(_ns) {
	ns = _ns;
	var resetManagement = ns.args[0] || false;
	if(resetManagement != false) resetManagement = true;

	let maxPorts = await countExecutables();
	let executables = [];

	let scanned = [];
	let toscan = [];
	let hacked = [];

	if(maxPorts > 0) {
		executables = await findExecutables();
	}

	var ownedServers = await ns.getPurchasedServers();

	var env = ns.getHostname();
	var target = env;

	if(home != env) {
		await ns.tprint("can only run quick-scan.js from $home");
		ns.exit();
	}

	await ns.clear(hackList);
	do {
		toscan = toscan.concat(await ns.scan(target));
		toscan = await compareScans(toscan,scanned);
		
		target = toscan.shift();
		scanned.push(target);
	} while(toscan.length > 0);

	while(scanned.length > 0) {
		target = scanned.shift();
		
		if(home == target || ownedServers.includes(target)) {
			continue;
		}

		if(ns.getServerNumPortsRequired(target) > maxPorts) {
			await ns.tprint("quick-scan.js: server " + target + " port values too high to nuke, skipping");
			continue;
		}

		hacked.push(target);
	}
	let bestHack = await getBestHackTarget(hacked); // todo: fix bestHack so it takes into account the time to run weaken(), grow() and hack()
	ns.tprint("quick-scan.js: best hack target is " + bestHack);

	if(hacked.length > 0) {
		for(let i = 0; i < hacked.length; i++) {
			await remoteExec(hacked[i],executables,maxPorts,bestHack);
		}
	}

	// future-proofing: in case I want to use servers for another purpose
	if(ownedServers.length > 0) {
		for(let i = 0; i < ownedServers.length; i++)  {
			await ownedServerExec(ownedServers[i],bestHack);
		}
	}

	await writeHacked(hacked);
	await ns.toast("quick-scan.js: All valid tasks completed.");
	await startManagement(bestHack,resetManagement);
}

// ["brutessh.exe","ftpcrack.exe","httpworm.exe","relaysmtp.exe","sqlinject.exe"]
async function remoteExec(target,executables,maxPorts,hackTarget) {
	if(maxPorts > 0) {
		for(let i = 0; i < maxPorts; i++) {
			if(executables[i] == "brutessh.exe") await ns.brutessh(target);
			if(executables[i] == "ftpcrack.exe") await ns.ftpcrack(target);
			if(executables[i] == "httpworm.exe") await ns.httpworm(target);
			if(executables[i] == "relaysmtp.exe") await ns.relaysmtp(target);
			if(executables[i] == "sqlinject.exe") await ns.sqlinject(target);
		}
	}
	await ns.nuke(target);
	await getFiles(target);
	await ns.killall(target);
	await rmScripts(target);
	await ns.scp(files,home,target);

	let maxThreads = Math.floor(await ns.getServerMaxRam(target) / await ns.getScriptRam(files[0]));
	if(maxThreads == 0) {
		await ns.print("quick-scan.js: Cannot run autohack.js on " + target + ". maxThreads is 0");
		return true;
	}

	await ns.exec(files[0], target, maxThreads, hackTarget);
	await ns.print("quick-scan.js: Started autohack.js on " + target + " using " + maxThreads + " threads.");

	return true;
}

async function ownedServerExec(target,bestHacked) {
	await ns.killall(target);
	await ns.scp(serverFiles,home,target);

	let maxThreads = Math.floor(await ns.getServerMaxRam(target) / await ns.getScriptRam(serverFiles[0]));

	await ns.exec(serverFiles[0], target, maxThreads, bestHacked);
	await ns.print("quick-scan.js: Started remote-hack-boost on " + target + " using " + maxThreads + " threads and targetting " + bestHacked);
}

async function startManagement(target,reset) {
	await ns.run(managementFile,1,reset,0,target);
}

async function getBestHackTarget(targetList) {
	let highest = 0;
	let current = 0;
	let best = "";

	for(let i = 0; i < targetList.length; i++) {
		current = await ns.getServerMaxMoney(targetList[i]);
		if(current > highest && ns.getHackingLevel() > ns.getServerRequiredHackingLevel(targetList[i])) {
			best = targetList[i];
			highest = await ns.getServerMaxMoney(best);
		}
	}
	return targetList[targetList.indexOf(best)];
}

async function countExecutables() {
	let total = 0;
	let executables = ["brutessh.exe","ftpcrack.exe","httpworm.exe","relaysmtp.exe","sqlinject.exe"];
	let quickLs = await ns.ls(home);
	for(let i = 0; i < quickLs.length; i++) {
		if(executables.includes(quickLs[i].toLowerCase())) total++;
	}
	return total;
}

async function findExecutables() {
	let executables = ["brutessh.exe","ftpcrack.exe","httpworm.exe","relaysmtp.exe","sqlinject.exe"];
	let quickLs = await ns.ls(home);
	let found = [];
	for(let i = 0; i < quickLs.length; i++) {
		if(executables.includes(quickLs[i].toLowerCase())) {
			found.push(executables[executables.indexOf(quickLs[i].toLowerCase())]);
		}
	}
	return found;
}

async function compareScans(results,compTo) {
	if(compTo.length == 0) {
		return results;
	}

	var looptime = results.length;
	for(let i = 0; i <= looptime; i++) {
		if(compTo.includes(results[0])) {
			results.shift();
		}
		else {
			results.push(results.shift());
		}
	}
	return results;
}

async function getFiles(target) {
	var fileList = ns.ls(target);
	var toCopy = [];

	for(let i = 0; i <= fileList.length; i++) {
		if(scpRegex.test(fileList[i])) {
			toCopy.push(fileList[i]);
		}
	}

	if(toCopy.length > 0) {
		await ns.tprint("quick-scan.js: copying files: " + toCopy + " from " + target + " to " + copyToServer);
		await ns.scp(toCopy, target, copyToServer);
	}
	else {
		await ns.print("quick-scan.js: no valid files on target " + target);
	}
	return true;
}

async function rmScripts(target) {
	let files = await ns.ls(target);
	let regex = /\.js$/gmu;

	for (let file in files) {
		if(regex.test(files[file])) {
			await ns.rm(files[file],target);
		}
	}
}

async function writeHacked(hackedList) {
	while(hackedList.length > 0) {
		let data = hackedList.shift() + ";"
		await ns.write(hackList, data, "a");
	}
	return true;
}

async function readHacked() {
	var raw  = "";
	var splitter = /;/gmu;

	if(await ns.read(hackList) == "") {
		return [];
	}
	else {
		raw = await ns.read(hackList);
		var result = raw.split(splitter);
		result.pop(); // required to remove the empty string at the end of the array
		return result;
	}
}