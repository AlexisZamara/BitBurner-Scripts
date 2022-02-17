/** @param {NS} ns **/
var ns;

export async function main(_ns) {
	ns = _ns;
	var target = ns.args[0];
	if(!ns.serverExists(target)) ns.exit();

	while(true) {
		if(ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
			await ns.grow(target);
		}
		else if(ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
			await ns.weaken(target);
		}
		else {
			ns.toast("localhack.js: hacking " + ns.nFormat(ns.getServerMoneyAvailable(target), "$0.000a") + " from " + target,"info",1500);
			await ns.hack(target);
		}
	}	
}