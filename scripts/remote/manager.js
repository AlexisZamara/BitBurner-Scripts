/** @param {NS} ns **/
export async function main(ns) {
	while(ns.getServerMaxMoney(ns.getHostname()) > ns.getServerMoneyAvailable(ns.getHostname())) {
		let thread = Math.floor((ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())) / ns.getScriptRam("/scripts/remote/self-weaken-grow.js"));
		thread = thread > 1 ? thread : 1;
		ns.run("/scripts/remote/self-weaken-grow.js",thread,ns.getHostname());
		await ns.sleep(Math.ceil(ns.getWeakenTime(ns.getHostname())) + ns.getGrowTime(ns.getHostname()));
	}
}