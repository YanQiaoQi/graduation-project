export function splitFileName(fileName: string) {
	const fileArr = fileName.split(".");
	const ext = fileArr.pop();
	const name = fileArr.join(".");
	return [name, ext];
}