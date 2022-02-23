/** @param {NS} ns **/
const home = "home";

export async function main(ns) {
	let cooldown = 50;

	while(true) {
		let node;
		const totalNodes = await ns.hacknet.numNodes();

		let moneyAvailable = (await ns.getServerMoneyAvailable(home)) * 0.3;
		let maxCost = Number.MAX_SAFE_INTEGER;
		let cheapestPart;
		let buyNextNode = false;

		if(totalNodes > 0) {
			for(let i = 0; i < totalNodes; i++) {
				if(ns.hacknet.getLevelUpgradeCost(i,1) < maxCost) {
					maxCost = ns.hacknet.getLevelUpgradeCost(i,1);
					cheapestPart = 0;
					node = i;
				}
				if(ns.hacknet.getRamUpgradeCost(i,1) < maxCost) {
					maxCost = ns.hacknet.getRamUpgradeCost(i,1);
					cheapestPart = 1;
					node = i;
				}
				if(ns.hacknet.getCoreUpgradeCost(i,1) < maxCost) {
					maxCost = ns.hacknet.getCoreUpgradeCost(i,1);
					cheapestPart = 2;
					node = i;
				}
			}
			if(ns.hacknet.getPurchaseNodeCost() < maxCost) {
				buyNextNode = true;
				maxCost = ns.hacknet.getPurchaseNodeCost();
			}
			
			if(moneyAvailable > maxCost) {
				if(buyNextNode) await ns.hacknet.purchaseNode();
				else {
					switch(cheapestPart) {
						case 0:
							await ns.hacknet.upgradeLevel(node,1);
							break;
						case 1:
							await ns.hacknet.upgradeRam(node,1);
							break;
						case 2:
							await ns.hacknet.upgradeCore(node,1);
							break;
						default:
							await ns.toast("hacknet-manager.js: illegal cheapestPart value. Terminating.","error",null);
							ns.exit();
					}
				}
				cooldown = 50;
			}
			else cooldown += 5000;
		}
		else {
			if(moneyAvailable > ns.hacknet.getPurchaseNodeCost()) {
				await ns.hacknet.purchaseNode();
				cooldown = 50;
			}
			else cooldown += 5000;
		}
		await ns.sleep(cooldown);
	}
}