/** @param {NS} ns **/
import * as utils from "/scripts/infiltration/infiltrator.js";

var ns;
const doc = eval("document");
let wind = eval("window");

export async function main(_ns) {
	ns = _ns;

	while(true) {
		while(utils.isInfiltrating()) {
			if(utils.whichGame()) {
				wind.addEventListener("keydown",utils.findSuccess(),{once: true});
				await ns.sleep(25);
				wind.dispatchEvent(new KeyboardEvent("keydown", {key: " "}));
			}
			await ns.sleep(25);
		}
		await ns.sleep(2500);
	}
}