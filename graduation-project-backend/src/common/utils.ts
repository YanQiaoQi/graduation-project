import { readFile, writeFile } from "fs/promises";
import Path from "path";
import CryptoJS from "crypto-js";
import { Encryption } from "../controllers/v1/certificate/interface";
import {
	Certificate,
	ColumnEncryption,
} from "../services/fabric-sdk/interface";

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
export async function writeEncryptedFile(
	targetPath: string,
	buffer: Buffer,
	encryption: Encryption
) {
	try {
		if (encryption === "clear") {
			writeFile(targetPath, buffer, "utf8");
			return;
		}
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

function encryptText(
	encryption: Encryption,
	data: string | number
) {
	try {
		if (encryption === "clear") return data;
		// 获取字符串数据
		const strData = String(data);

		// 加密
		const dataAfterEncryption = CryptoJS[
			encryption
		]?.encrypt(strData, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		});

		console.log("加密成功");
		return dataAfterEncryption?.toString();
	} catch (e) {
		console.log("加密失败:", e);
	}
}

function decryptText(
	encryption: Encryption,
	data: string | number
) {
	if (encryption === "clear") return data;
	const strData = String(data);
	// 解密
	let decrypt = CryptoJS[encryption].decrypt(strData, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});
	const decryptUtf8 =
		CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return decryptUtf8;
}

function encryptCertificate(
	certificate: Certificate,
	columnEncryption: ColumnEncryption,
	prevColumnEncryption?: ColumnEncryption
) {
	for (let key in columnEncryption) {
		if (
			columnEncryption.hasOwnProperty(key) &&
			certificate.hasOwnProperty(key)
		) {
			const prop = key as keyof Certificate;
			const encryption = columnEncryption[prop];
			const prevEncryption = prevColumnEncryption?.[prop];
			let value = certificate[prop];
			if (prevEncryption) {
				value = decryptText(prevEncryption, value);
			}
			// @ts-ignore
			certificate[prop] = encryptText(encryption, value);
		}
	}
}

function decryptCertificate(
	certificate: Certificate,
	columnEncryption: ColumnEncryption
) {
	for (let key in columnEncryption) {
		if (
			columnEncryption.hasOwnProperty(key) &&
			certificate.hasOwnProperty(key)
		) {
			const prop = key as keyof Certificate;
			const encryption = columnEncryption[prop];
			let value = certificate[prop];
			// @ts-ignore
			certificate[prop] = decryptText(encryption, value);
		}
	}
}

export const cryptography = {
	encrypt: {
		// 源文件 -> 加密文件
		file: async (encryption: Encryption, path: string) => {
			try {
				if (encryption === "clear") return path;
				// 获取字符串数据
				const data = await readFile(
					path,
					getBufferEncoding(path)
				);

				// 加密
				const dataAfterEncryption = CryptoJS[
					encryption
				].encrypt(data, key, {
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7,
				});

				// 保存加密文件
				writeFile(
					path,
					dataAfterEncryption.toString(),
					"utf8"
				);
				console.log("加密写入成功");
			} catch (e) {
				console.log("加密写入失败:", e);
			}
		},
		// 源文本 -> 加密文本
		text: encryptText,
		certificate: encryptCertificate,
	},
	decrypt: {
		// 加密文件 -> 解密后 流
		file: async (encryption: Encryption, path: string) => {
			// 获取加密文本
			const data = await readFile(path, "utf8");
			if (encryption === "clear")
				return Buffer.from(data, getBufferEncoding(path));
			// 解密
			const decrypt = CryptoJS[encryption].decrypt(
				data,
				key,
				{
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7,
				}
			);
			const decryptUtf8 =
				CryptoJS.enc.Utf8.stringify(decrypt).toString();

			return Buffer.from(
				decryptUtf8,
				getBufferEncoding(path)
			);
		},
		// 加密后文本 -> 解密后文本
		text: decryptText,
		certificate: decryptCertificate,
	},
};
