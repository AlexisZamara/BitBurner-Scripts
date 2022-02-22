/** @param {NS} ns **/
import * as scanner from "/scripts/utils/deep-scan.js";
import * as fileManager from "/scripts/utils/files.js";

var ns;
const home = "home";
const executables = ["brutessh.exe","ftpcrack.exe","httpworm.exe","relaysmtp.exe","sqlinject.exe"];

const remoteFiles = ["/scripts/remote/manager.js","/scripts/remote/self-weaken-grow.js"];
const remoteManager = "/scripts/remote/manager.js";

const ownedFiles = ["/scripts/batching/coordinator.js","/scripts/batching/hack.js","/scripts/batching/grow.js","/scripts/batching/weaken.js"]
const hwgwCoordinator = "scripts/batching/coordinator.js";

export async function main(_ns) {
	ns = _ns;

	// nuke every server and propagate remote files
	const ports = countExes();
	const servers = await scanner.deepScan(ns);
	for(let s of servers) {
	 	await autoNuke(ports,s);
	}
	const ownedServers = ns.getPurchasedServers();
	ns.run("/scripts/infiltration/auto-solve.js");
	ns.run("/scripts/utils/server-ranking.js");
	await autoStart(ownedServers);
}

function countExes() {
	const files = ns.ls(home,".exe");
	let exes = [];
	if(!files) return false;
	for(let file of files) {
		if(executables.includes(file.toLowerCase())) exes.push(file);
	}
	return exes.length > 0 ? exes : false;
}

async function autoNuke(ports,target) {
	if(ports) {
		if(target.reqPorts <= ports.length) {
			for(let port of ports) {
				if(port == "brutessh.exe") await ns.brutessh(target.serverName);
				if(port == "ftpcrack.exe") await ns.ftpcrack(target.serverName);
				if(port == "httpworm.exe") await ns.httpworm(target.serverName);
				if(port == "relaysmtp.exe") await ns.relaysmtp(target.serverName);
				if(port == "sqlinject.exe") await ns.sqlinject(target.serverName);
			}
			ns.nuke(target.serverName);
			if(target.contents.length > 0) await fileManager.getFiles(ns,target.contents,target.serverName);
			ns.killall(target.serverName);
			for(let file of remoteFiles) {
				await ns.rm(file,target.serverName);
			}
			await ns.scp(remoteFiles,home,target.serverName);
			ns.exec(remoteManager,target.serverName);
		}
	}
	else {
		if(target.reqPorts == 0) {
			ns.nuke(target.serverName);
			if(target.contents.length > 0) await fileManager.getFiles(ns,target.contents,target.serverName);
			ns.killall(target.serverName);
			for(let file of remoteFiles) {
				await ns.rm(file,target.serverName);
			}
			await ns.scp(remoteFiles,home,target.serverName);
			ns.exec(remoteManager,target.serverName);
		}
	}
}

async function autoStart(servers) {
	for(let server of servers) {
		ns.killall(server);
		for(let file of ownedFiles) {
			await ns.rm(file,server);
		}
		await ns.scp(ownedFiles,home,server);
		ns.exec(hwgwCoordinator,server);
	}
}