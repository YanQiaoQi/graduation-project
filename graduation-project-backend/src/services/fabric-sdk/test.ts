import CA from "./features/ca";
import wallet from "./features/wallet";
import gateway from "./features/gateway";

async function enrollAdmain() {
	try {
		const id = "admin";
		const secret = "adminpw";
		await wallet.init();
		if (await wallet.isExist(id)) return;

		const enrollment = await CA.enroll({
			id,
			secret,
		});

		await wallet.put({
			enrollment,
			id,
		});
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

async function registerUser({ id }: RegisterUserArgus) {
	try {
		// Create a new CA client for interacting with the CA.

		// Create a new file system based wallet for managing identities.
		await wallet.init();
		if (await wallet.isExist(id)) return;
		// Check to see if we've already enrolled the admin user.

		// build a user object for authenticating with the CA
		const adminUser = await wallet.getUser("admin");
		if (!adminUser) return;

		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await CA.register({
			register: adminUser,
			req: {
				affiliation: "org1.department1",
				enrollmentID: id,
				role: "client",
			},
		});

		const enrollment = await CA.enroll({
			id,
			secret,
		});

		await wallet.put({
			enrollment,
			id,
		});
		console.log(
			'Successfully registered and enrolled admin user "appUser" and imported it into the wallet'
		);
	} catch (error) {
		console.error(
			`Failed to register user "appUser": ${error}`
		);
		process.exit(1);
	}
}

type InvokeArgus = {
	id: string;
	channel: string;
	ccname: string;
	func: string;
	argus: any[];
};

async function invoke({
	id,
	channel,
	ccname,
	func,
	argus,
}: InvokeArgus) {
	try {
		if (!(await wallet.isExist(id))) return;

		// Create a new file system based wallet for managing identities.
		// const walletPath = path.join(process.cwd(), "wallet");
		// const wallet = await Wallets.newFileSystemWallet(
		// 	walletPath
		// );
		// console.log(`wallet path: ${walletPath}`);

		// // Check to see if we've already enrolled the user.
		// const identity = await wallet.get("appUser");
		// if (!identity) {
		// 	console.log(
		// 		'An identity for the user "appUser" does not exist in the wallet'
		// 	);
		// 	console.log(
		// 		"Run the registerUser.ts application before retrying"
		// 	);
		// 	return;
		// }

		// Create a new gateway for connecting to our peer node.

		// Get the network (channel) our contract is deployed to.

		// Get the contract from the network.
		await gateway.init(id);
		const contract = await gateway.getContract(
			channel,
			ccname
		);

		// Submit the specified transaction.
		// createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
		// changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
		const payloadBuffer = await contract.submitTransaction(
			func,
			...argus
		);

		const payload = JSON.parse(
			payloadBuffer.toString("utf-8")
		);

		console.log(payload);

		console.log(`Transaction has been submitted`);

		// Disconnect from the gateway.
		await gateway.disconnect();
	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

// async function query() {
// 	try {
// 		// Create a new file system based wallet for managing identities.
// 		const walletPath = path.join(process.cwd(), "wallet");
// 		const wallet = new FileSystemWallet(walletPath);
// 		console.log(`wallet path: ${walletPath}`);

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

export async function initFabricSDK() {
	const id = "appUser";
	const channel = "mychannel";
	const ccname = "myapp";

	await enrollAdmain();
	await registerUser({ id });
	await invoke({
		id,
		channel,
		ccname,
		func: "queryDataHash",
		argus: ["2"],
	});
}
