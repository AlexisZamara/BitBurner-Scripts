/** @param {NS} ns **/

const doc = eval("document");
export async function main(ns) {
	// this will convert your RAM into toasts.
	// find a way to convert it so it doesn't pop up toasts but still triggers the noodle eating.
	// also find a way to have it run without entering this page, this should only require going to the page once,
	// grabbing the function and saving it to a constant should be easy
	// changing the function is something else.
	while(true) {
		let button = doc.querySelector("#root > div > div.MuiBox-root.css-1ik4laa > div.jss3.MuiBox-root.css-0 > button:nth-child(12)");
		if(button?.innerText == "Eat noodles") {
			let func = button[Object.keys(button)[1]].onClick;
			for(let i = 0; i < 100; i++) {
				eval(func({isTrusted: true}));
			}
			await ns.sleep(10);
		}
		else {
			await ns.sleep(10000);
		}
	}
}