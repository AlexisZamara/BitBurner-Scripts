/** @param {NS} ns **/

import * as utils from "/scripts/infiltration/infiltrator.js";
const wind = eval("window");
const doc = eval("document");

export async function main(ns) {
	const runs = ns.args[0] ?? 10;
	const timed = ns.args[1] ?? false;

	if(ns.getPlayer().city != "Sector-12") {
		await travelTo();
	}
	if(timed) {
		let time = Date.now() + (runs * 60 * 1e3);
		let i = 0;
		while(Date.now() < time) {
			await loop(ns);
			i++;
			console.log("infiltration " + i + " completed at " + new Date());
			await ns.sleep(10);
		}
	}
	else {
		for(let i = 0; i < runs; i++) {
			await loop(ns);
			console.log("infiltration " + i + " completed at " + new Date());
		}
	}
}

async function loop(ns) {
	await enterMegacorp();
	beginInfil();
	while(utils.isInfiltrating()) {
		while(utils.whichGame()) {
			const succ = utils.findSuccess();
			eval(succ());
			await ns.sleep(100);
		}
		await ns.sleep(100);
		if(doc.querySelector("#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(1) > h4")?.innerText == "Infiltration successful!") break;
	}
	getRewards();
}

async function travelTo() {
	for(let button of doc.querySelectorAll("div.MuiBox-root>div.MuiDrawer-root.MuiDrawer-docked>div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation0.MuiDrawer-paper.MuiDrawer-paperAnchorLeft.MuiDrawer-paperAnchorDockedLeft>ul.MuiList-root.MuiList-padding>div.MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered>div.MuiCollapse-wrapper.MuiCollapse-vertical>div.MuiCollapse-wrapperInner.MuiCollapse-vertical>div.MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button")) {
		if(button[Object.keys(button)[1]].children[0][0][0].props.children.props.title == "Travel") {
			button[Object.keys(button)[1]].onClick = button[Object.keys(button)[1]].onClick({isTrusted: true});
			button.click();
			break;
		}
	}
	for(let button of doc.querySelectorAll("div.MuiBox-root>div>div>div>p>span")) {
		if(button.innerText == "S") {
			button[Object.keys(button)[1]].onClick = button[Object.keys(button)[1]].onClick({isTrusted: true});
			button.click();
			break;
		}
	}
	let div = doc.querySelector("body>div.MuiModal-root>div.MuiBackdrop-root");
	div.click();
}

async function enterMegacorp() {
	let button = doc.querySelector("#root > div > div.MuiBox-root.css-1ik4laa > div.MuiDrawer-root.MuiDrawer-docked> div > ul > div:nth-child(8) > div > div > div:nth-child(1)");
	button.click();
	button = doc.querySelectorAll("div.MuiBox-root>div.MuiBox-root>div.MuiBox-root>p")[18].querySelector("span");
	button.click();
}

function beginInfil() {
	let button = doc.querySelectorAll("div.MuiBox-root>div.MuiBox-root>div.MuiBox-root>div.MuiBox-root>button")[4];
	let func = button[Object.keys(button)[1]].onClick;
	eval(func({isTrusted: true}));
	button = doc.querySelector("#root > div > div.jss3.MuiBox-root.css-0 > div > div:nth-child(7) > button");
	button.click();
}

function getRewards() {
	let button = doc.querySelector("#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12 > div > div:nth-child(3) > button");
	button.click();
}