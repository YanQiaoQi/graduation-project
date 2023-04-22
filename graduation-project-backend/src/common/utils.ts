export function splitFileName(filename: string) {
	const fileArr = filename.split(".");
	const ext = fileArr.pop() as string;
	const name = fileArr.join(".") as string;
	return [name, ext];
}

export function getFileInfo(filenameWithExt: string) {
	const fileArr = filenameWithExt.split("-");
	const email = fileArr.shift();
	const created = fileArr.shift();
	const filename = fileArr.join("-");
	const [name, ext] = splitFileName(filename);
	return [name, created, ext] as [string, string, string];
}
