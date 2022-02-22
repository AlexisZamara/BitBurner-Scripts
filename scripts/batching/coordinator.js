/** @param {NS} ns **/
export async function main(ns) {
	let cd = 1000;

	while(true) {
		if(!sessionStorage.getItem(ns.getHostname())) {
			cd += 1000;
			await ns.sleep(cd);
			continue;
		}
		const batch = JSON.parse(sessionStorage.getItem(ns.getHostname()));
		let batchNumber = 0;
		const errorMargin = 25;

		if(batch.pLevel != localStorage.getItem("pLevel")) {
			await ns.sleep(cd);
			continue;
		}
		if(batch.cost > (ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname()))) {
			await ns.sleep(50);
			continue;
		}
		let startTime = Date.now();
		let gStart = Math.floor((Math.max(batch.w1Time,(batch.hTime + batch.gTime)) - batch.gTime) * 1000);
		let w2Start = Math.floor((batch.w2Time - batch.gTime) * 1000);

		ns.run("/scripts/batching/hack.js",batch.hThread,batch.serverName,batchNumber,startTime);
		ns.run("/scripts/batching/weaken.js",batch.w1Thread,batch.serverName,batchNumber,1,startTime);
		await ns.sleep(w2Start);
		ns.run("/scripts/batching/weaken.js",batch.w2Thread,batch.serverName,batchNumber,2,startTime);
		await ns.sleep(gStart);
		ns.run("/scripts/batching/grow.js",batch.gThread,batch.serverName,batchNumber,startTime);

		await ns.sleep(Math.ceil(((batch.cycleTime - batch.gTime) + errorMargin)) * 1000);
		batchNumber++;
		cd = 1000;
	}
}