import {
	X509Identity,
	Wallets,
	Gateway,
} from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import { ccp, walletPath, CA_DOMAIN } from "./common";
import { User } from "./interface";
// import {
// 	createCA,
// 	getCA,
// 	getGateway,
// 	getWallet,
// } from "./common";

const userId = "appUser";

async function enrollAdmain() {
	try {
		const caInfo = ccp.certificateAuthorities[CA_DOMAIN];
		const caTLSCACerts = caInfo.tlsCACerts.pem;
		const ca = new FabricCAServices(
			caInfo.url,
			{ trustedRoots: caTLSCACerts, verify: false },
			caInfo.caName
		);

		const wallet = await Wallets.newFileSystemWallet(
			walletPath
		);

		const identity = await wallet.get("admin");
		if (identity) {
			console.log(
				'An identity for the admin user "admin" already exists in the wallet'
			);
			return;
		}

		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await ca.enroll({
			enrollmentID: "admin",
			enrollmentSecret: "adminpw",
		});
		const x509Identity: X509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: "Org1MSP",
			type: "X.509",
		};
		await wallet.put("admin", x509Identity);
		console.log(
			'Successfully enrolled admin user "admin" and imported it into the wallet'
		);
	} catch (error) {
		console.error(
			`Failed to enroll admin user "admin": ${error}`
		);
		process.exit(1);
	}
}

async function registerUser(id: string) {
	try {
		const caURL = ccp.certificateAuthorities[CA_DOMAIN].url;
		const ca = new FabricCAServices(caURL);

		const wallet = await Wallets.newFileSystemWallet(
			walletPath
		);

		const userIdentity = await wallet.get(id);
		if (userIdentity) {
			console.log(
				`An identity for the user ${id} already exists in the wallet`
			);
			return;
		}

		// Check to see if we've already enrolled the admin user.
		const adminIdentity = await wallet.get("admin");
		if (!adminIdentity) {
			console.log(
				'An identity for the admin user "admin" does not exist in the wallet'
			);
			return;
		}

		// build a user object for authenticating with the CA
		const provider = wallet
			.getProviderRegistry()
			.getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(
			adminIdentity,
			"admin"
		);

		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await ca.register(
			{
				affiliation: "org1.department1",
				enrollmentID: id,
				role: "client",
			},
			adminUser
		);
		const enrollment = await ca.enroll({
			enrollmentID: id,
			enrollmentSecret: secret,
		});
		const x509Identity: X509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: "Org1MSP",
			type: "X.509",
		};
		await wallet.put(id, x509Identity);
		console.log(
			`Successfully registered and enrolled admin user ${id} and imported it into the wallet`
		);
	} catch (error) {
		console.error(`Failed to register user id: ${error}`);
		process.exit(1);
	}
}

type InvokeArgus = {
	id?: string;
	func: string;
	argus: any[];
};

async function invoke({
	id = userId,
	func,
	argus,
}: InvokeArgus) {
	try {
		const wallet = await Wallets.newFileSystemWallet(
			walletPath
		);

		const identity = await wallet.get(id);
		if (!identity) {
			console.log(
				"An identity for the user id does not exist in the wallet"
			);
			return;
		}

		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: id,
			discovery: { enabled: true, asLocalhost: true },
		});

		const network = await gateway.getNetwork("mychannel");

		const contract = network.getContract("myapp");

		const res = await contract.submitTransaction(
			func,
			...argus
		);

		console.log(res.toString("utf-8"));
		console.log(`Transaction has been submitted`);

		gateway.disconnect();

		return res;
	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

async function set(key: string, value: User) {
	return invoke({
		func: "storeDataHash",
		argus: [key, JSON.stringify(value)],
	})
		.then(() => {
			return {
				status: 1,
				message: "设置成功",
			};
		})
		.catch((e) => {
			return {
				status: 0,
				message: "设置失败",
			};
		});
}

async function get(key: string) {
	return invoke({
		func: "queryDataHash",
		argus: [key],
	})
		.then((res) => {
			if (res) {
				const { DataHash } = JSON.parse(
					res.toString("utf-8")
				);
				return {
					status: 1,
					data: JSON.parse(DataHash),
				};
			}
			return {
				status: 0,
				message: "未有该key的数据",
				data: null,
			};
		})
		.catch((e) => {
			return {
				status: 0,
				message: e,
				data: null,
			};
		});
}

// async function query() {
// 	try {
// 		// Create a new file system based wallet for managing identities.
// 		const walletPath = path.join(process.cwd(), "wallet");
// 		const wallet = new FileSystemWallet(walletPath);
// 		console.log(`Wallet path: ${walletPath}`);

// 		// Check to see if we've already enrolled the user.
// 		const userExists = await wallet.exists("user1");
// 		if (!userExists) {
// 			console.log(
// 				'An identity for the user "user1" does not exist in the wallet'
// 			);
// 			console.log(
// 				"Run the registerUser.ts application before retrying"
// 			);
// 			return;
// 		}

// 		// Create a new gateway for connecting to our peer node.
// 		const gateway = new Gateway();
// 		await gateway.connect(ccpPath, {
// 			wallet,
// 			identity: "user1",
// 			discovery: { enabled: true, asLocalhost: true },
// 		});

// 		// Get the network (channel) our contract is deployed to.
// 		const network = await gateway.getNetwork("mychannel");

// 		// Get the contract from the network.
// 		const contract = network.getContract("fabcar");

// 		// Evaluate the specified transaction.
// 		// queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
// 		// queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
// 		const result = await contract.evaluateTransaction(
// 			"queryAllCars"
// 		);
// 		console.log(
// 			`Transaction has been evaluated, result is: ${result.toString()}`
// 		);
// 	} catch (error) {
// 		console.error(
// 			`Failed to evaluate transaction: ${error}`
// 		);
// 		process.exit(1);
// 	}
// }

async function init() {
	const channel = "mychannel";
	const chaincode = "myapp";
	await enrollAdmain();
	await registerUser(userId);
}

const FabricSDK = {
	init,
	set,
	get,
};

export default FabricSDK;
