/** @param {NS} ns **/
var ns;

const home = "home";
const ownedFiles = ["/scripts/batching/coordinator.js","/scripts/batching/hack.js","/scripts/batching/grow.js","/scripts/batching/weaken.js"];
const hwgwCoordinator = "scripts/batching/coordinator.js";

export async function main(_ns) {
	ns = _ns;

	let cooldown = 100000;
	
	while(true) {
		let moneyAvailable = (await ns.getServerMoneyAvailable(home)) * 0.3;
		let serverRamLimit = await ns.getPurchasedServerMaxRam();
		let maxCost = Number.MAX_SAFE_INTEGER;
		let cheapestUpgrade;
		let buyNextServer = false;

		if(ns.getPurchasedServers().length == ns.getPurchasedServerLimit()) {
			let base = 2;
			let power = 1;
			let lowestRam = Number.MAX_SAFE_INTEGER;
			let server = await ns.getPurchasedServerLimit + 10;

			for(let i = 0; i < ns.getPurchasedServerLimit(); i++) {
				let serverName = "server-" + i;
				if(!ns.getPurchasedServers().includes(serverName)) {
					continue;
				}
				if(ns.getServer(serverName).maxRam < lowestRam) {
					lowestRam = await ns.getServer(serverName).maxRam;
					server = i;
				}
			}

			if(server < ns.getPurchasedServerLimit()) {
				if(moneyAvailable > ns.getPurchasedServerCost(Math.pow(base,power))) {
					for(let i = 1; i <= 20; i++) {
						if(moneyAvailable > ns.getPurchasedServerCost(Math.pow(base,i))) {
							power = i;
						}
					}
					let serverName = "server-" + server;
					if(Math.min(Math.pow(base,power),serverRamLimit) > ns.getServerMaxRam(serverName)) {
						await ns.killall(serverName);
						await ns.deleteServer(serverName);
						await ns.purchaseServer(serverName, Math.min(Math.pow(base,power),serverRamLimit));
						await restartServices(serverName);
						cooldown = 100000;
					}
					cooldown += 50000;
				}
				else {
					cooldown += 50000;
				}
			}
			else {
				break;
			}
		}
		else {
			let base = 2;
			let power = 1;
			let serverName = "";

			if(moneyAvailable > ns.getPurchasedServerCost(Math.pow(base,power))) {
				for(let i = 1; i <= 20; i++) {
					if(moneyAvailable > ns.getPurchasedServerCost(Math.pow(base,i))) {
						power = i;
					}
				}
				for(let i = 0; i < ns.getPurchasedServerLimit(); i++) {
					serverName = "server-" + i;
					if(!ns.getPurchasedServers().includes(serverName)) {
						break;
					}
				}
				await ns.purchaseServer(serverName, Math.min(Math.pow(base,power),serverRamLimit));
				await restartServices(serverName);
				cooldown = 100000;
			}
			else {
				cooldown += 50000;
			}
		}
		await ns.sleep(cooldown);
	}
	ns.toast("server-manager.js: all servers RAM maxed out.","success",null);
}

async function restartServices(targetServer) {
	for(file of ownedFiles) {
		await ns.scp(file, home, targetServer);
	}
	await ns.exec(hwgwCoordinator,serverName);
}