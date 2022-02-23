/** @param {NS} ns **/

const doc = eval("document");
// found in src/crimes.ts
const crimes = [{
	crime: "Shoplift",
	time: 2e3,
	money: 15e3,
	killer: false,
	karma: 0.1
},{
	crime: "Rob store",
	time: 60e3,
	money: 400e3,
	killer: false,
	karma: 0.5
},{
	crime: "Mug someone",
	time: 4e3,
	money: 36e3,
	killer: false,
	karma: 0.25
},{
	crime: "Larceny",
	time: 90e3,
	money: 800e3,
	killer: false,
	karma: 1.5
},{
	crime: "Deal Drugs",
	time: 10e3,
	money: 120e3,
	killer: false,
	karma: 0.5
},{
	crime: "Bond Forgery",
	time: 300e3,
	money: 4.5e6,
	killer: false,
	karma: 0.1
},{
	crime: "Traffick illegal Arms",
	time: 40e3,
	money: 600e3,
	killer: false,
	karma: 1
},{
	crime: "Homicide",
	time: 3e3,
	money: 45e3,
	killer: true,
	karma: 3
},{
	crime: "Grand theft Auto",
	time: 80e3,
	money: 1.6e6,
	killer: false,
	karma: 5
},{
	crime: "Kidnap and Ransom",
	time: 120e3,
	money: 3.6e6,
	killer: false,
	karma: 6
},{
	crime: "Assassinate",
	time: 300e3,
	money: 12e6,
	killer: true,
	karma: 10
},{
	crime: "Heist",
	time: 600e3,
	money: 120e6,
	killer: false,
	karma: 15
}];

export async function main(ns) {
	const killer = ns.args[0] ?? true;
	const lowKarma = ns.args[1] ?? false; // not yet implemented
	let wait = 1000;

	while(true) {
		if(isCriming()) await ns.sleep(wait); // wait for the crime to complete
		if(onCrimePage()) {
			let best; // determine which crime would be best to run
			for(let crime of crimes) {
				if(!killer && crime.killer) continue;
				crime.chance = Number.parseFloat(await crimeOdds(crime));
				if(!best) {
					best = crime;
					continue;
				}
				if((best.money / best.time * best.chance) < (crime.money / crime.time * crime.chance)) {
					best = crime;
					continue;
				}
			}
			await becomeUngovernable(best);
			console.log(best);
			await ns.sleep(best.time); // click on the chosen crime and await for the duration of that crime
			continue; // we don't want to sleep again yet
		}
		await ns.sleep(wait * 60);
	}
}

function onCrimePage() {
	for(let div of doc.querySelectorAll("div.MuiBox-root>div.MuiBox-root>h4.MuiTypography-root.MuiTypography-h4")) {
		if(div?.innerHTML == "The Slums") {
			return true;
		}
	}
	return false;
}

function isCriming() {
	for(let div of doc.querySelectorAll("div.MuiGrid-root.MuiGrid-item>p.MuiTypography-root.MuiTypography-body1>p.MuiTypography-root.MuiTypography-body1")) {
		if(div?.innerHTML.includes("You are attempting to")) {
			return true;
		}
	}
	return false;
}

async function crimeOdds(crime) {
	const regex = /[0-9]{1,3}\.[0-9]{2}%/gmu;
	for(let div of doc.querySelectorAll("div.MuiBox-root>div.MuiBox-root>button.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButtonBase-root")) {
		if(div?.innerHTML.includes(crime.crime)) {
			return div.innerHTML.match(regex)[0];
		}
	}
	return "0%";
}

async function becomeUngovernable(crime) {
	for(let div of doc.querySelectorAll("div.MuiBox-root>div.MuiBox-root>button.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButtonBase-root")) {
		if(div?.innerHTML.includes(crime.crime)) {
			div[Object.keys(div)[1]].onClick = div[Object.keys(div)[1]].onClick({isTrusted: true}); // falsify the isTrusted
			div.click(); // click the thing
			return;
		}
	}
}