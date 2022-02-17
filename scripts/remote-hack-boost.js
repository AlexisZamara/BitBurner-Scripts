/** @param {NS} ns **/
var ns;

export async function main(_ns) {
	ns = _ns;
	var hackTarget = ns.args[0];

	while(true) {
		if(ns.getServerMoneyAvailable(hackTarget) < ns.getServerMaxMoney(hackTarget)) {
			await ns.grow(hackTarget);
		}
		else {
			await ns.weaken(hackTarget);
		}
	}
}