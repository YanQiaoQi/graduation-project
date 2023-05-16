import {
	X509Identity,
	Wallets,
	Gateway,
} from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import { ccp, walletPath, CA_DOMAIN } from "./common";
import {
	ApplyItem,
	Certificate,
	ColumnEncryption,
	FabricRes,
	User,
	FabricResWithData,
	ArrayPropOfUser,
	ItemType,
	Email,
	Ledger,
} from "../../common/type";

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

		const FabricRes = await contract.submitTransaction(
			func,
			...argus
		);

		console.log(`Transaction has been submitted`);

		gateway.disconnect();

		return FabricRes;
	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

export async function set(
	key: string,
	value: User
): Promise<any> {
	return invoke({
		func: "storeDataHash",
		argus: [key, JSON.stringify(value)],
	}).then(() => {
		return {
			code: 1,
			message: "设置成功",
		};
	});
}

export async function get(
	key: string
): Promise<FabricResWithData<User>> {
	return invoke({
		func: "queryDataHash",
		argus: [key],
	}).then((FabricRes) => {
		if (FabricRes?.toString("utf-8")) {
			const data = JSON.parse(
				JSON.parse(FabricRes.toString("utf-8"))
			);
			return {
				code: 1,
				message: "获取成功",
				data,
			};
		}
		return {
			code: 0,
			message: "没有",
			data: {
				password: "",
				info: {
					created: Date.now(),
				},
				columnEncryption: {
					name: "clear",
					type: "clear",
					encryption: "clear",
					created: "clear",
					size: "clear",
					description: "clear",
					extension: "clear",
					last_updated: "clear",
				},
				certificates: [],
				othersApplications: [],
				myApplications: [],
				authorizedCertificates: {},
			},
		};
	});
}

export function addItems(prop: ArrayPropOfUser) {
	return async (
		key: string,
		items: ItemType[]
	): Promise<FabricRes> => {
		const { data: user } = await get(key);
		//@ts-ignore
		user[prop].push(...items);
		await set(key, user);
		return {
			code: 1,
			message: "证据更新成功",
		};
	};
}

export function deleteItem(prop: ArrayPropOfUser) {
	return async (
		key: Email,
		index: number
	): Promise<FabricRes> => {
		const { data: user } = await get(key);
		//@ts-ignore
		user[prop].splice(index, 1);
		await set(key, user);
		return {
			code: 1,
			message: "证据删除成功",
		};
	};
}

export function getItem<T = any>(prop: ArrayPropOfUser) {
	return async (
		key: Email,
		index: number
	): Promise<FabricResWithData<T>> => {
		const { data: user } = await get(key);
		return {
			code: 1,
			data: user[prop][index] as T,
			message: "证据删除成功",
		};
	};
}

export function getItemByCreated<T extends ItemType>(
	prop: ArrayPropOfUser
) {
	return async (
		key: Email,
		created: number
	): Promise<FabricResWithData<T>> => {
		const { data: user } = await get(key);
		//@ts-ignore
		const item = user[prop].find(
			//@ts-ignore
			(item) => item.created === created
		);
		return {
			code: 1,
			data: item as T,
			message: "证据删除成功",
		};
	};
}

export const addOthersApply = addItems(
	"othersApplications"
);

export const addMyApplication = addItems("myApplications");

export const addCertificates = addItems("certificates");

export const deleteCertificate = deleteItem("certificates");

export const deleteMyApplication = deleteItem(
	"myApplications"
);

export const deleteOthersApplication = deleteItem(
	"othersApplications"
);

export const getCertificate = getItem("certificates");

export const getMyApplication = getItem<ApplyItem>(
	"myApplications"
);

export const getOthersApplication = getItem<ApplyItem>(
	"othersApplications"
);

export async function isAuthorized(
	key: string,
	password: string
): Promise<FabricRes> {
	const { data: user } = await get(key);
	if (password === user.password) {
		return {
			code: 1,
			message: "鉴权成功",
		};
	}
	throw Error("鉴权失败");
}

/**
 * 查
 * 获取 user.certificates
 *
 * @param key
 * @returns
 */
export async function getCertificates(
	key: string
): Promise<FabricRes> {
	const { data: user } = await get(key);
	return {
		code: 1,
		message: "证据查询成功",
		data: {
			columnEncryption: user?.columnEncryption,
			certificates: user.certificates,
		},
	};
}

export async function getLedger(): Promise<Ledger> {
	const data = await invoke({
		func: "queryAllDataHash",
		argus: [],
	});
	const ledger = JSON.parse(
		data?.toString("utf-8") ?? "{}"
	);
	for (let key in ledger) {
		const user = JSON.parse(
			JSON.parse(ledger[key])
		) as User;
		ledger[key] = user;
	}
	return ledger;
}

/**
 * 查
 * 获取所有用户的 certificates
 *
 * @returns
 */
export async function getAllCertificates(): Promise<FabricRes> {
	const data = await invoke({
		func: "queryAllDataHash",
		argus: [],
	});

	if (data) {
		const ledger = JSON.parse(data.toString("utf-8"));
		const allCertificates = [];
		for (let key in ledger) {
			const user = JSON.parse(
				JSON.parse(ledger[key])
			) as User;
			allCertificates.push({
				columnEncryption: user.columnEncryption,
				certificates: user.certificates,
				user: key,
			});
		}
		return {
			code: 1,
			data: allCertificates,
			message: "查询成功",
		};
	}
	return {
		code: 0,
		message: "查询失败",
	};
}

/**
 * 改
 * 更新 user.columnEncryption
 *
 * @param key
 * @param columnEncryption
 * @returns
 */
export async function updateColumnEncryption(
	key: string,
	columnEncryption: ColumnEncryption
): Promise<FabricRes> {
	const { data: user } = await get(key);
	user.columnEncryption = columnEncryption;
	await set(key, user);
	return {
		code: 1,
		message: "更新成功",
	};
}

export async function init() {
	const channel = "mychannel";
	const chaincode = "myapp";
	await enrollAdmain();
	await registerUser(userId);
}

class Fabric {
	constructor() {}
}
