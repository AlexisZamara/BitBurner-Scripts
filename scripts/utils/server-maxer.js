/** @param {NS} ns **/
var ns;

const growWeaken = "/scripts/auto/grow-weaken.js";

export async function main(_ns) {
	ns = _ns;

	const servers = JSON.parse(localStorage.getItem("hackableServers"));
	let pLevel = ns.getHackingLevel();
	let cd = 1000;
	// use at least 1 thread or 20% of max RAM for threads
	// if 20% of RAM is not available, use half of available RAM

	while(true) {
		let arg;
		let toMax = [];
		for(let s of servers) {
			if(s.maxMoney > ns.getServerMoneyAvailable(s.serverName)) toMax.push(s);
			await ns.sleep(10);
		}
		if(pLevel == ns.getHackingLevel() && toMax.length == 0) {
			cd += 1000;
			await ns.sleep(cd);
			continue;
		}
		while(toMax.length > 0) {
			const threads = Math.ceil(Math.min((ns.getServer("home").maxRam * 0.2),(ns.getServer("home").maxRam - ns.getServer("home").ramUsed) * 0.5) / ns.getScriptRam(growWeaken));
			if(!arg) {
				arg = toMax[0].serverName;
				toMax.shift();
				ns.run(growWeaken,threads,arg);
				await ns.sleep(50);
				continue;
			}
			if(arg != toMax[0].serverName && !ns.isRunning(growWeaken,"home",arg)) {
				arg = toMax[0].serverName;
				ns.run(growWeaken,threads,arg);
				await ns.sleep(10);
				continue;
			}
			cd += 1000;
			await ns.sleep(cd);
		}
		cd = 1000;
		await ns.sleep(cd);
	}
}