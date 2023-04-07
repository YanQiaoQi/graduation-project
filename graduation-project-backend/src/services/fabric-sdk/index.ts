import {
	FileSystemWallet,
	X509WalletMixin,
	Gateway,
} from "fabric-network";
import fs from "fs";
import path from "path";
import {
	createCA,
	getCA,
	getGateway,
	getWallet,
} from "./common";

const ccpPath = path.resolve(
	__dirname,
	"connection-org1.json"
);

async function enrollAdmain() {
	try {
		// Create a new CA client for interacting with the CA.
		const ca = createCA();

		// Create a new file system based wallet for managing identities.
		const wallet = getWallet();

		// Check to see if we've already enrolled the admin user.
		const adminExists = await wallet.exists("admin");
		if (adminExists) {
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
		const identity = X509WalletMixin.createIdentity(
			"Org1MSP",
			enrollment.certificate,
			enrollment.key.toBytes()
		);
		await wallet.import("admin", identity);
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

type RegisterUserArgus = {
	org?: string;
	id: string;
};

async function registerUser({
	org = "Org1MSP",
	id,
}: RegisterUserArgus) {
	if (!id) {
		console.log("未传入id");
		return;
	}
	try {
		// Create a new file system based wallet for managing identities.
		const wallet = getWallet();

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(id);
		if (userExists) {
			console.log(
				`An identity for the user "${id}" already exists in the wallet`
			);
			return;
		}

		// Check to see if we've already enrolled the admin user.
		const adminExists = await wallet.exists("admin");
		if (!adminExists) {
			console.log(
				'An identity for the admin user "admin" does not exist in the wallet'
			);
			await enrollAdmain();
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = await getGateway(wallet, "admin");

		// Get the CA client object from the gateway for interacting with the CA.
		const ca = getCA(gateway);
		const adminIdentity = gateway.getCurrentIdentity();

		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await ca.register(
			{
				affiliation: "org1",
				enrollmentID: id,
				role: "client",
			},
			adminIdentity
		);
		const enrollment = await ca.enroll({
			enrollmentID: id,
			enrollmentSecret: secret,
		});
		const userIdentity = X509WalletMixin.createIdentity(
			org,
			enrollment.certificate,
			enrollment.key.toBytes()
		);
		await wallet.import(id, userIdentity);
		console.log(
			`Successfully registered and enrolled admin user "${id}" and imported it into the wallet`
		);
	} catch (error) {
		console.error(
			`Failed to register user "${id}": ${error}`
		);
		process.exit(1);
	}
}

type InvokeArgus = {
	id: string;
	channel: string;
	chaincode: string;
	func: string;
	argus: any[];
};

async function invoke({
	id,
	channel,
	chaincode,
	func,
	argus,
}: InvokeArgus) {
	try {
		// Create a new file system based wallet for managing identities.
		const wallet = getWallet();

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(id);
		if (!userExists) {
			console.log(
				'An identity for the user "user1" does not exist in the wallet'
			);
			console.log(
				"Run the registerUser.ts application before retrying"
			);
			return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = await getGateway(wallet, id);

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork(channel);

		// Get the contract from the network.
		const contract = network.getContract(chaincode);

		// // Submit the specified transaction.
		// // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
		// // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
		const a = await contract.submitTransaction(
			func,
			...argus
		);

		console.log(`Transaction has been submitted`);

		// Disconnect from the gateway.
		await gateway.disconnect();
	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		// process.exit(1);
	}
}

async function query() {
	try {
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), "wallet");
		const wallet = new FileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists("user1");
		if (!userExists) {
			console.log(
				'An identity for the user "user1" does not exist in the wallet'
			);
			console.log(
				"Run the registerUser.ts application before retrying"
			);
			return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccpPath, {
			wallet,
			identity: "user1",
			discovery: { enabled: true, asLocalhost: true },
		});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork("mychannel");

		// Get the contract from the network.
		const contract = network.getContract("fabcar");

		// Evaluate the specified transaction.
		// queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
		// queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
		const result = await contract.evaluateTransaction(
			"queryAllCars"
		);
		console.log(
			`Transaction has been evaluated, result is: ${result.toString()}`
		);
	} catch (error) {
		console.error(
			`Failed to evaluate transaction: ${error}`
		);
		process.exit(1);
	}
}

export async function initFabricSDK() {
	const id = "user3";
	const channel = "mychannel";
	const chaincode = "myapp";

	await enrollAdmain();
	// await registerUser({ id });
	//"storeDataHash","1","123456"
	await invoke({
		id,
		channel,
		chaincode,
		func: "storeDataHash",
		argus: ["2", "2"],
	});
}
