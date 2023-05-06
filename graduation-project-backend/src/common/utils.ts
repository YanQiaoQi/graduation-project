import { readFile, writeFile } from "fs/promises";
import Path from "path";
import CryptoJS from "crypto-js";
import { Encryption } from "../controllers/v1/certificate/interface";

export function splitFileName(filename: string) {
	const fileArr = filename.split(".");
	const ext = fileArr.pop() as string;
	const name = fileArr.join(".") as string;
	return [name, ext];
}

const key = CryptoJS.enc.Utf8.parse("0123456789abcdef"); //密钥

export function getBufferEncoding(path: string) {
	const ext = Path.extname(path);
	const image = [".jpg", ".png"];
	if (image.includes(ext)) {
		return "base64";
	}
	return "utf8";
}

// 将文件加密
export async function encryptFile(
	path: string,
	encryption: Encryption
) {
	try {
		const data = await readFile(
			path,
			getBufferEncoding(path)
		);
		const dataAfterEncryption = CryptoJS[
			encryption
		].encrypt(data, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		});

		writeFile(path, dataAfterEncryption.toString(), "utf8");
		console.log("加密写入成功");
	} catch (e) {
		console.log("加密写入失败:", e);
	}
}

export function encryptText(
	data: string | number,
	encryption: Encryption
) {
	try {
		console.log(encryption);

		const strData = String(data);
		const dataAfterEncryption = CryptoJS[
			encryption
		]?.encrypt(strData, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		});
		console.log("加密成功:");
		return dataAfterEncryption.toString();
	} catch (e) {
		console.log("加密失败:", e);
	}
}

// 将文件加密
export async function writeEncryptedFile(
	targetPath: string,
	buffer: Buffer,
	encryption: Encryption
) {
	try {
		const data = buffer.toString(
			getBufferEncoding(targetPath)
		);
		const dataAfterEncryption = CryptoJS[
			encryption
		].encrypt(data, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		});

		writeFile(
			targetPath,
			dataAfterEncryption.toString(),
			"utf8"
		);
		console.log("加密写入成功");
	} catch (e) {
		console.log("加密写入失败:", e);
	}
}

// 将加密文件解码为流
export async function decrypt(
	path: string,
	encryption: Encryption
) {
	const data = await readFile(path, "utf8");
	let decrypt = CryptoJS[encryption].decrypt(data, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});
	const decryptUtf8 =
		CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return Buffer.from(decryptUtf8, getBufferEncoding(path));
}

export function decryptStr(
	data: string,
	encryption: Encryption
) {
	let decrypt = CryptoJS[encryption].decrypt(data, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});
	const decryptUtf8 =
		CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return decryptUtf8;
}
