/** @param {NS} ns **/

const scandb = "/db/deep-scan.txt";

export async function main(ns) {
	const servers = JSON.parse(await ns.read(scandb));
	for(let server of servers) {
		let term = document.querySelector("#terminal-input");
		if(server.parents == "home" && server.isAdmin && server.hackLevel <= ns.getHackingLevel()) {
			term.value = "connect " + server.serverName;
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
			term.value = "backdoor";
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
			ns.print(server.serverName + " backdooring...");
			await ns.sleep(backdoorTime(ns,server) * 1000 + 1000);
			if(server.children.length > 0) {
				await backdoorChildren(ns,servers,term,server);
			}
			term.value = "home";
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
		}
	}
}

async function backdoorChildren(ns,servers,term,current) {
	for(let server of servers) {
		if(current.children.includes(server.serverName) && server.isAdmin && server.hackLevel <= ns.getHackingLevel()) {
			term.value = "connect " + server.serverName;
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
			term.value = "backdoor";
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
			ns.print(server.serverName + " backdooring...");
			await ns.sleep(backdoorTime(ns,server) * 1000 + 1000);
			if(server.children.length > 0) {
				await backdoorChildren(ns,servers,term,server);
			}
			term.value = "connect " + server.parents;
			term[Object.keys(term)[1]].onChange({target:term});
			term[Object.keys(term)[1]].onKeyDown({keyCode: 13, key: "Enter", isTrusted: true, preventDefault: ()=>null});
		}
	}
}

function backdoorTime(ns,server) {
	let time = 2.5 * server.hackLevel * ns.getServerSecurityLevel(server.serverName) + 500;
	time /= ns.getHackingLevel() + 50;
	time = (5 * time) / ns.getPlayer().hacking_speed_mult;
	return time / 4;
}