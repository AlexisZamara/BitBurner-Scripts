/** @param {NS} ns **/

const scandb = "/db/deep-scan.txt";

export async function deepScan(ns) {
	if(await ns.read(scandb)) return JSON.parse(await ns.read(scandb));
	let scanned = new CustomArray();
	let toscan = new CustomArray();
	const ownedServers = ns.getPurchasedServers();
	let host = ns.getHostname();
	let serverList = new CustomArray();

	do {
		toscan = toscan.concat(ns.scan(host));
		toscan = await compareScans(ownedServers,toscan);
		toscan = await compareScans(scanned,toscan);
		scanned.push(toscan[0]);

		if(scanned[scanned.length - 1] != "home") serverList.push(await createScanObj(ns,scanned[scanned.length - 1],serverList));
		host = toscan.shift();
	} while(toscan.length > 0)

	await ns.write(scandb,JSON.stringify(serverList),"w");
	return serverList;
}

async function createScanObj(ns,current,list) {
	let data = new CustomArray();
	let parent;
	let children = new CustomArray(...ns.scan(current));

	for(let i = 0; i < children.length; i++) {
		if(ns.scan(children[i]).includes(current)) {
			parent = children[i];
			break;
		}
	}

	for(let item of list) {
		if(item.serverName == parent) {
			data.push(item.depth + 1);
			data.push(parent);
			data.push(children.removeFrom(parent));
			return new ScannedServer(ns,current,data);
		}
	}
	data.push(0);
	data.push(parent);
	data.push(children.removeFrom(parent));
	return new ScannedServer(ns,current,data);
}

async function compareScans(scanned,toscan) {
	if(scanned.length == 0) return toscan;
	let len = toscan.length;
	for(let i = 0; i < len; i++) {
		if(scanned.includes(toscan[0])) toscan.shift();
		else toscan.push(toscan.shift());
	}
	return toscan;
}

class ScannedServer {
	constructor(ns,serverName,data) {
		this.serverName = serverName;
		this.depth = data[0];
		this.parents = data[1];
		this.children = data[2];
		this.contents = ns.ls(serverName,".lit");
		this.ram = ns.getServer(serverName).maxRam;
		this.cores = ns.getServer(serverName).cpuCores;
		this.reqPorts = ns.getServer(serverName).numOpenPortsRequired;
		this.isAdmin = ns.getServer(serverName).hasAdminRights;
		this.hackLevel = ns.getServer(serverName).requiredHackingSkill;
		this.minSecurity = ns.getServer(serverName).minDifficulty;
		this.maxMoney = ns.getServer(serverName).moneyMax;
	}
}

class CustomArray extends Array {
	removeFrom = function(target) {
		this.splice(this.indexOf(target),1);
		return this;
	}
	insert = function(index,item) {
		this.splice(index,0,item);
		return this;
	}
}