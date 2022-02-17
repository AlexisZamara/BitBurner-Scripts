/** @param {NS} ns **/
var ns;

export async function main(_ns) {
	ns = _ns;

	let ramMult = 1000000000;
	let servers = ns.getPurchasedServers();
	for(let server in servers) {
		ns.tprint(servers[server] + " with " + ns.nFormat(ns.getServer(servers[server]).maxRam * ramMult,"0.000 b") + " of RAM");
	}
}