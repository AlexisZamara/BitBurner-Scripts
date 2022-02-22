/** @param {NS} ns **/

export async function getFiles(ns,files,target) {
	if(!files) return false;
	return await ns.scp(files,target,"home");
}

// unused because it seems to be broken for absolutely no reason
export async function multils(ns,regex,target) {
	const files = ns.ls(target);
	let remoteFiles = [];
	for(let file of files) {
		if(regex.test(file)) remoteFiles.push(file);
	}
	return remoteFiles;
}