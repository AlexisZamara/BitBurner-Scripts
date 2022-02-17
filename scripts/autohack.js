/** @param {NS} ns **/
export async function main(ns) {
	var target = ns.args[0] || "n00dles";

	if(target != "home") {
		while(true)	{
			if(ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
				await ns.grow(target);
				continue;
			}

			if(ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
				await ns.weaken(target);
			}
			else {
				await ns.hack(target);
			}
		}
	}
	else {
		ns.tprint("cannot hack home");
		ns.exit();
	}
}