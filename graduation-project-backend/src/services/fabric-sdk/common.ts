import FabricCAServices from "fabric-ca-client";
import {
	FileSystemWallet,
	Gateway,
	GatewayOptions,
	Wallet,
	X509WalletMixin,
} from "fabric-network";
import fs from "fs";
import path from "path";

export const WSL_IP = "172.18.119.135";

function getCcpAdaptedWSL(ccpPath: string, ip = WSL_IP) {
	const originalCcpJson = fs.readFileSync(ccpPath, "utf8");
	const adaptedCcpJson = originalCcpJson
		.replaceAll("https", "http")
		.replaceAll("localhost", ip);
	return JSON.parse(adaptedCcpJson);
}

const ccpPath = path.resolve(
	__dirname,
	"connection-org1.json"
);

const ccp = getCcpAdaptedWSL(ccpPath);

const walletPath = path.resolve(__dirname, "wallet");

export function getWallet() {
	// console.log(`Wallet path: ${walletPath}`);
	return new FileSystemWallet(walletPath);
}

export function createCA() {
	const caInfo =
		ccp.certificateAuthorities["ca.example.com"];
	const caTLSCACerts = caInfo.tlsCACerts.pem;
	const ca = new FabricCAServices(
		caInfo.url,
		{ trustedRoots: caTLSCACerts, verify: false },
		caInfo.caName
	);
	return ca;
}

export function getCA(gateway: Gateway) {
	return gateway.getClient().getCertificateAuthority();
}

export async function getGateway(
	wallet: Wallet,
	identity: string
) {
	const gateway = new Gateway();
	await gateway.connect(ccpPath, {
		wallet,
		identity: identity,
		discovery: { enabled: true, asLocalhost: true },
	});
	return gateway;
}
