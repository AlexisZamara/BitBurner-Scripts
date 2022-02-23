/** @param {NS} ns **/

var ns;
const logFile  = "/db/stocks-logs.txt";

export async function main(_ns) {
	ns = _ns;
	const safeForecast = ns.args[0] || 0.4;
	const profitMargin = ns.args[1] || 0.4;
	const safeMargin = ns.args[2] || 0.15;
	let cycle = 0;
	let iteration = 1;
	const minimumInvestment = 1000000000;
	await ns.write(logFile,Date().toString() + ": started new stonks cycles\n","a");

	let assets = 0;
	let positions = new Object();
	for(let sym of ns.stock.getSymbols()) {
		if(ns.stock.getPosition(sym)[0] > 0) {
			positions = Object.assign({[sym]: {qty: ns.stock.getPosition(sym)[0], val: ns.stock.getPosition(sym)[1], sale: ns.stock.getSaleGain(sym,ns.stock.getPosition(sym)[0],"Long")}}, positions);
			assets += ns.stock.getPosition(sym)[0] * ns.stock.getPosition(sym)[1];
		}
	}
	let stonksStats = new Object();

	while(true) {
		let logger = "";
		let cash = ns.getPlayer().money * 0.7;
		// keep track of stock fluctuation
		stonksStats = await averageStonks(iteration,stonksStats);
		iteration++;
		// manage current stocks
		for(let sym of Object.keys(positions)) {
			if(ns.stock.getSaleGain(sym,ns.stock.getPosition(sym)[0],"Long") >= positions[sym].sale) {
				positions[sym].sale = ns.stock.getSaleGain(sym,ns.stock.getPosition(sym)[0],"Long");
				if(((positions[sym].sale / (positions[sym].qty * positions[sym].val)) - 1) >= profitMargin) {
					logger += "Cycle: " + cycle + " - Iteration: " + iteration + " -- MAXED PROFIT: ";
					logger += "Sold " + positions[sym].qty + " shares of " + sym + " with margin of +" + ns.nFormat((positions[sym].sale / (positions[sym].qty * positions[sym].val) - 1),"0.00%") + " for ";
					let saleValue = ns.stock.sell(sym,positions[sym].qty);
					logger +=  ns.nFormat(saleValue,"$0.000a") + " individually and totaling " + ns.nFormat((saleValue * positions[sym].qty),"$0.000a") + "\n";
					assets -= positions[sym].qty * positions[sym].val;
					delete positions[sym];
				}
				continue;
			}
			if(1 - (ns.stock.getSaleGain(sym,ns.stock.getPosition(sym)[0],"Long") / positions[sym].sale) >= safeMargin * 2) {
				logger += "Cycle: " + cycle + " - Iteration: " + iteration + " -- STOCK DECLINE: ";
				logger += "Sold " + positions[sym].qty + " shares of " + sym + " with margin of +" + ns.nFormat((positions[sym].sale / (positions[sym].qty * positions[sym].val) - 1),"0.00%") + " for ";
				let saleValue = ns.stock.sell(sym,positions[sym].qty);
				logger +=  ns.nFormat(saleValue,"$0.000a") + " individually and totaling " + ns.nFormat((saleValue * positions[sym].qty),"$0.000a") + "\n";
				assets -= positions[sym].qty * positions[sym].val;
				delete positions[sym];
				continue;
			}
			if(1 - (ns.stock.getSaleGain(sym,ns.stock.getPosition(sym)[0],"Long") / (positions[sym].qty * positions[sym].val)) >= safeMargin) {
				logger += "Cycle: " + cycle + " - Iteration: " + iteration + " -- LOSS PREVENTION: ";
				logger += "Sold " + positions[sym].qty + " shares of " + sym + " with margin of " + ns.nFormat(1 - (positions[sym].sale / (positions[sym].qty * positions[sym].val)),"0.00%") + " for ";
				let saleValue = ns.stock.sell(sym,positions[sym].qty);
				logger +=  ns.nFormat(saleValue,"$0.000a") + " individually and totaling " + ns.nFormat((saleValue * positions[sym].qty),"$0.000a") + "\n";
				assets -= positions[sym].qty * positions[sym].val;
				delete positions[sym];
				continue;
			}
		}

		// buy new stocks if any
		if(iteration == 20) {
			let skip = false;
			if(assets > cash) skip = true;
			if(cash < minimumInvestment) skip = true;
			let best = [];
			for(let stonk of Object.keys(stonksStats)) {
				if(skip) break;
				if(stonksStats[stonk].inc > 12 && (stonksStats[stonk].avgfc / 20) > safeForecast && !positions[stonk]) { 
					// only accept servers that meet requirements: 12 or more increases, high enough safe forecast, no currently owned stocks
					for(let i = 0; i < 3; i++) {
						if(!best[i]) {
							best.push(stonk);
							break;
						}
						if(stonksStats[best[i]].inc < stonksStats[stonk]) {
							best.splice(best.indexOf(i),0,stonk);
							break;
						}
					}
				}
			}
			if(best.length == 0) skip = true;
			let split = sum(best[0],best[1],best[2],stonksStats);
			for(let i = 0; i < Math.min(3,best.length); i++) {
				if(skip) break;
				// buy the top 3 servers
				ns.stock.buy(best[i],Math.min(Math.floor(cash * stonksStats[best[i]].vol / split / ns.stock.getAskPrice(best[i])),ns.stock.getMaxShares(best[i])));
				positions = Object.assign({[best[i]]: {qty: ns.stock.getPosition(best[i])[0], val: ns.stock.getPosition(best[i])[1], sale: ns.stock.getSaleGain(best[i],ns.stock.getPosition(best[i])[0],"Long")}},positions);
				assets += ns.stock.getPosition(best[i])[0] * ns.stock.getPosition(best[i])[1];
				logger += "Cycle: " + cycle + " -- ";
				logger += "Purchased " + ns.stock.getPosition(best[i])[0] + " shares of " + best[i] + " at " + ns.nFormat(ns.stock.getPosition(best[i])[1],"$0.000a");
				logger += " individually and for a total of " + ns.nFormat(ns.stock.getPosition(best[i])[0] * ns.stock.getPosition(best[i])[1],"$0.000a") + "\n";
			}
			iteration = 1;
			cycle++;
		}
		if(logger != "") {
			console.log(logger);
			await ns.write(logFile,logger,"a");
		}
		await ns.sleep(6000);
	}
}

async function averageStonks(iteration,stonksStats) {
	if(iteration == 1) {
		stonksStats = {};
		for(let sym of ns.stock.getSymbols()) {
			stonksStats = Object.assign({[sym]: {
				base: ns.stock.getBidPrice(sym),
				 last: ns.stock.getBidPrice(sym),
				  inc: 0,
				   vol: ns.stock.getVolatility(sym),
					avgfc: ns.stock.getForecast(sym)}}, stonksStats);
		}
	}
	else {
		for(let stonk of Object.keys(stonksStats)) {
			if(stonksStats[stonk].last < ns.stock.getBidPrice(stonk)) stonksStats[stonk].inc++;
			stonksStats[stonk].last = ns.stock.getBidPrice(stonk);
			stonksStats[stonk].avgfc += ns.stock.getForecast(stonk);
		}
	}
	return stonksStats;
}

function sum(a,b,c,stonksStats) {
	return Number(stonksStats[a]?.vol ?? Number.isFinite(a)) + Number(stonksStats[b]?.vol ?? Number.isFinite(b)) + Number(stonksStats[c]?.vol ?? Number.isFinite(c));
}