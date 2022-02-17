/** @param {NS} ns **/
var ns;

var home = "home";
var scanfile = "deepscan-report.txt";

export async function main(_ns) {
	ns = _ns;
	var ownedServers = await ns.getPurchasedServers();
	var pathTo = ns.args[0] || false;

	var env = ns.getHostname();
	var target = env;

	var scanned = [];
	var toscan = [];

	var scanArray = [];

	if(env != home) {
		await ns.tprint("deep-scan-report.js: this can only be run from $home");
		ns.exit();
	}

	if(!ns.fileExists(scanfile,home)) {
		await ns.tprint("deep-scan-report.js: deepscan-report.txt not found on $home");
		ns.exit();
	}

	await ns.clear(scanfile);
	toscan = toscan.concat(await ns.scan(target));

	while(toscan.length > 0) {
		toscan = await compareScans(toscan,scanned);
		toscan = await compareScans(toscan,ownedServers);

		target = toscan.shift();

		if(target == null) continue;
		scanned.push(target);
		
		if(scanned[scanned.length - 1] != home) {
			scanArray.push(await deepScan(scanned[scanned.length - 1], scanned, scanArray));
		}

		toscan = toscan.concat(await ns.scan(target));
	}

	// placeholder
	// TODO: create an export method for this
	// make it beautiful or something
	for(let i = 0; i < scanArray.length; i++) {
		let data = await parser(scanArray[i]);
		await ns.write(scanfile, data, "a");
	}

	// fixes needed: array.includes() breaks when string is one character long - it returns first match instead of exact match
	if(pathTo != false) {
		if(scanArray.find(e => e.serverName.includes(pathTo)) != undefined) {
			let scannedPathTarget = scanArray.find(e => e.serverName.includes(pathTo));
			let path = [];
			path.push(scannedPathTarget.serverName);
			let pathParent = scannedPathTarget.serverName;
			
			for(let i = 0; i < scannedPathTarget.depth; i++) {
				pathParent = scanArray.find(e => e.children.some(f => f.includes(pathParent))).serverName;
				path.unshift(pathParent);
			}
			
			let pathString = "";
			for(let i = 0; i < path.length; i++) {
				if(i == path.length - 1) {
					pathString += path[i];
				}
				else {
					pathString += path[i] + " --> ";
				}
			}

			ns.tprint("Path to " + pathTo + " is: " + pathString);
		}
		else {
			ns.tprint(pathTo + " is not a valid path target");
		}
	}
}

async function compareScans(toscan,scanned) {
	let result = [];

	if(scanned.length == 0) {
		return toscan;
	}

	while(toscan.length > 0) {
		if(scanned.includes(toscan[0]) || toscan[0] == home) {
			toscan.shift();
		}
		else {
			result.push(toscan.shift());
		}
	}

	return result;
}

async function deepScan(target,scanned,scanArray) {
	let depth = 0;
	let parents = [];
	let children = [];

	let scanRes = await ns.scan(target);

	if(scanRes.includes(home)) {
		depth = 0;
		parents.push(scanRes.splice(scanRes.indexOf(home),1));
		children.push(scanRes);
	}
	else {
		if(scanArray.length < 1) {
			await ns.toast("deep-scan-report.js: fatal error in deepScan() scanArray cannot be empty","error",null);
			ns.exit();
		}
		for(let i = 0; i < scanned.length; i++) {
			if(scanned.includes(scanRes[i])) {
				parents.push(scanRes.splice(scanRes.indexOf(scanRes[i]),1));
			}
		}
		children.push(scanRes);
		depth = scanArray.find((e => e.serverName.includes(parents[0]))).depth + 1; // possible issue: if parents have different depth, depth will be incorrectly labeled
	}

	return new ScannedServer(
		target,
		depth,
		parents,
		children,
		await ns.ls(target),
		await ns.getServerMaxRam(target),
		await ns.getServerNumPortsRequired(target),
		await ns.getServerRequiredHackingLevel(target),
		await ns.getServerMinSecurityLevel(target),
		await moneyToString(await ns.getServerMaxMoney(target))
	);
}

async function moneyToString(money) {
	if(money == 0) return "$0";

	return await ns.nFormat(money, "$0.000a");
}

async function parser(server) {
	let offset = server.depth;
	let tabulation = "    ";
	let offsetTabs = "";
	let arrow = "\-->"
	if(offset > 0) {
		for(let i = 0; i < offset; i++) {
			offsetTabs += tabulation;
		}
	}

	let string = offsetTabs + arrow + server.serverName + ": " + server.money + " / " + server.ram + " / " + server.contents + "\n";
	return string;
}

// info that cannot obtained through coding as of right now: cpu, ports, backdoor
class ScannedServer {
	constructor(serverName,depth,parents,children,contents,ram,nukeLevel,hackLevel,minSecurity,maxMoney) {
		this.serverName = serverName;
		this.depth = depth;
		this.parents = parents;
		this.children = children;
		this.contents = contents;
		this.ram = ram;
		this.nukeLevel = nukeLevel;
		this.hackLevel = hackLevel;
		this.security = minSecurity;
		this.money = maxMoney;
	}
}