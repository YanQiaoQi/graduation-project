import fs from "fs";
import path from "path";

export const WSL_IP = "172.31.91.173";

function getCcpAdaptedWSL(ccpPath: string, ip = WSL_IP) {
	const originalCcpJson = fs.readFileSync(ccpPath, "utf8");
	const adaptedCcpJson = originalCcpJson
		.replaceAll("https", "http")
		.replaceAll("localhost", ip);
	return JSON.parse(adaptedCcpJson);
}

export const ccpPath = path.resolve(
	__dirname,
	"connection-org1.json"
);

export const walletPath = path.resolve(__dirname, "wallet");

export const ccp = getCcpAdaptedWSL(ccpPath);

export const CA_DOMAIN = "ca.example.com";
