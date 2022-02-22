/** @param {NS} ns **/
var ns;

const doc = eval("document");
const scandb = "/db/deep-scan.txt";
const cycleOffset = 100;

// src/CONSTANTS.ts
// src/Server/formulas/Grow.ts
// src/Hacking.ts
// weaken has a BN multiplier value but it is either between 1 and 1.34 or exactly 2
// because it is never below 1, we can ignore it for now
const gameConstants = {
	serverBaseGrowthRate: 1.03, // Unadjusted Growth rate
 	serverMaxGrowthRate: 1.0035, // Maximum possible growth rate (max rate accounting for server security)
  	serverFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
	serverWeakenAmount: 0.05, // Amount by which server's security decreases when weakened
	growTimeMultiplier: 3.2,
	weakenTimeMultiplier: 4
};

export async function main(_ns) {
	ns = _ns;
	if(!localStorage.getItem("hackableServers")) await storeServers(JSON.parse(await ns.read(scandb)));
	const servers = JSON.parse(localStorage.getItem("hackableServers"));
	const workers = ns.getPurchasedServers();

	let pLevel = localStorage.getItem("pLevel") ?? 0;
	let cd = 1000;

	while(true) {
		if(pLevel == ns.getHackingLevel()) {
			cd += 1000;
			await ns.sleep(cd);
			if(!ns.isRunning("/scripts/utils/server-maxer.js")) ns.run("/scripts/utils/server-maxer.js");
			continue;
		}

		pLevel = ns.getHackingLevel();
		cd = 1000;

		for(let s of servers) {
			if(ns.getServerRequiredHackingLevel(s.serverName) > pLevel || !s.isAdmin) continue;
			if(s.maxMoney > ns.getServerMoneyAvailable(s.serverName)) continue;

			// 1 + (weight * Math.pow(intelligence, 0.8)) / 600; 
			// intBonus: weight appears to be hardcoded as 1 for now
			const intBonus = 1 + Math.pow(await grabInt(),0.8) / 600; 
			const coreBonus = 1; 
			// thread count can further be reduced by dividing by coreBonus on the server that handles the request
			// formula is 1 + (s.cores - 1) / 16; 
			const hThread = Math.floor(ns.hackAnalyzeThreads(s.serverName,s.maxMoney * 0.80));
			const gThread = Math.ceil(ns.growthAnalyze(s.serverName,5,1));
			const w1Thread = Math.ceil((hThread * gameConstants.serverFortifyAmount) / (gameConstants.serverWeakenAmount * coreBonus));
			const w2Thread = Math.ceil((gThread * gameConstants.serverFortifyAmount) / (gameConstants.serverWeakenAmount * coreBonus));
			const hTime = calcHackTime(intBonus,(s.hackLevel * s.minSecurity));
			const gTime = hTime * gameConstants.growTimeMultiplier;
			const w1Time = calcHackTime(intBonus,(s.hackLevel * (s.minSecurity + hThread * gameConstants.serverFortifyAmount))) * gameConstants.weakenTimeMultiplier;
			const w2Time = calcHackTime(intBonus,(s.hackLevel * (s.minSecurity + gThread * gameConstants.serverFortifyAmount))) * gameConstants.weakenTimeMultiplier;
			const cycleTime = w2Time - (Math.max(w1Time, hTime + gTime) - gTime) + cycleOffset;
			const maxThread = Math.max(hThread,gThread,w1Thread,w2Thread);
			const score = (s.maxMoney * ns.hackAnalyzeChance(s.serverName)) / (cycleTime * Math.pow(maxThread,2));
			const cost = ns.getScriptRam("/scripts/batching/hack.js") * hThread + ns.getScriptRam("/scripts/batching/grow.js") * gThread + ns.getScriptRam("/scripts/batching/weaken.js") * (w1Thread + w2Thread);
			
			const rankedServer = {
				serverName: s.serverName,
				score: score,
				hThread: hThread,
				hTime: hTime,
				w1Thread: w1Thread,
				w1Time: w1Time,
				gThread: gThread,
				gTime: gTime,
				w2Thread: w2Thread,
				w2Time: w2Time,
				cycleTime: cycleTime,
				pLevel: pLevel,
				cost: cost
			};
			await ns.sleep(50);
			let minRam = 9999999999;
			let pick;
			for(let worker of workers) {
				if(!!sessionStorage.getItem(worker) && JSON.parse(sessionStorage.getItem(worker)).pLevel > pLevel) continue;
				if(((cost) + ns.getScriptRam("/scripts/batching/coordinator.js")) > (ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker))) continue;
				if((ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker)) > minRam) continue;
				minRam = (ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker));
				pick = worker;
				await ns.sleep(50);
			}
			console.log("ok");
			if(!pick) continue;
			sessionStorage.setItem(pick,JSON.stringify(rankedServer));
		}
		localStorage.setItem("pLevel",pLevel);
		await ns.sleep(cd);
	}
}

async function storeServers(servers) {
	let sortedArray = new CustomArray();
	for(let s of servers) {
		if(s.maxMoney == 0) continue;
		if(sortedArray.length == 0) {
			sortedArray.push(s);
			continue;
		}
		if(s.maxMoney > sortedArray[0]) sortedArray.unshift(s);
		else {
			for(let i = 0; i < sortedArray.length; i++) {
				await ns.sleep(5);
				if(s.maxMoney > sortedArray[i]) {
					sortedArray.insert(i,s);
					break;
				}
				if(i == sortedArray.length - 1) {
					sortedArray.push(s);
					break;
				}
			}
		}
	}
	localStorage.setItem("hackableServers",JSON.stringify(sortedArray));
}

function calcHackTime(intBonus,mult) {
	let skillFactor = 2.5 * mult + 500;
	skillFactor /= ns.getPlayer().hacking + 50;
	return ((5 * skillFactor) / (ns.getPlayer().hacking_speed_mult * intBonus));
}

async function grabInt() {
	let div = doc.querySelector("div.jss2.MuiBox-root");
	let propKey = Object.keys(div)[0];
	return div[propKey].pendingProps.children.props.player.intelligence;
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