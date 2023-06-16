import {
	X509Identity,
	Wallets,
	Gateway,
	Contract,
} from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import { ccp, walletPath, CA_DOMAIN } from "./common";
import { FabricRes } from "../../common/type";
import {
	Email,
	Evidence,
	Ledger,
	Users,
	User as NewUser,
	Meta,
	EvidenceType,
	EvidenceEncryption,
	EvidenceFieldEncryptionMap,
	Application,
	ApplyType,
	Status,
	User,
} from "./type";
import {
	cryptography,
	splitFileName,
	writeEncryptedFile,
} from "../../common/utils";
import path from "path";

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

class Fabric {
	constructor() {
		this.init();
	}
	async init() {
		await enrollAdmain();
		await registerUser(this.basic.userId);
		this.contract = await this.fetchContract();
		this.ledger = await this.fetchLedger();
	}

	basic = {
		userId: "appUser",
		channel: "mychannel",
		chaincode: "myapp",
	};

	// 账本
	ledger?: Ledger;
	private async fetchLedger(): Promise<Ledger> {
		const buffer = await this.invoke({
			func: "queryAllDataHash",
		});
		const ledger = JSON.parse(
			buffer?.toString("utf-8") ?? "{}"
		);
		for (let key in ledger) {
			const value = JSON.parse(JSON.parse(ledger[key]));
			ledger[key] = value;
		}

		console.log("远程账本", ledger);

		return {
			meta: ledger.meta ?? {
				evidence: {
					num: 0,
				},
				application: {
					num: 0,
				},
			},
			users: ledger.users ?? {},
			evidences: ledger.evidences ?? [],
			applications: ledger.applications ?? [],
		};
	}

	// 智能合约
	private contract?: Contract;
	private async fetchContract() {
		const wallet = await Wallets.newFileSystemWallet(
			walletPath
		);

		const identity = await wallet.get(this.basic.userId);
		if (!identity) {
			console.log(
				"An identity for the user id does not exist in the wallet"
			);
			return;
		}

		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: this.basic.userId,
			discovery: { enabled: true, asLocalhost: true },
		});

		const network = await gateway.getNetwork(
			this.basic.channel
		);

		return network.getContract(this.basic.chaincode);
	}
	private async invoke({
		func,
		argus = [],
	}: {
		func: string;
		argus?: string[];
	}) {
		try {
			if (!this.contract) {
				this.contract = await this.fetchContract();
			}
			const FabricRes =
				await this.contract?.submitTransaction(
					func,
					...argus
				);

			console.log(`Transaction has been submitted`);

			return FabricRes;
		} catch (error) {
			console.error(
				`Invoke Error: Failed to submit transaction: ${error}`
			);
		}
	}

	// 远程账本
	private async setRemoteLedger(
		key: keyof Ledger,
		value: Users | Evidence[] | Meta | Application[]
	): Promise<FabricRes> {
		return this.invoke({
			func: "storeDataHash",
			argus: [key, JSON.stringify(value)],
		})
			.then(() => {
				return {
					code: 1,
					message: "设置成功",
				} as FabricRes;
			})
			.catch(() => {
				return {
					code: 0,
					message: "设置失败",
				};
			});
	}
	batchUpdate = 0;
	private shouldUpdateRemoteLedger() {
		this.batchUpdate++;
		if (this.batchUpdate === 3) {
			this.batchUpdate = 0;
			return true;
		}
		return false;
	}
	private async updateRemoteLedger(
		props: (keyof Ledger)[]
	) {
		try {
			if (this.shouldUpdateRemoteLedger()) {
				for (let key in this.ledger) {
					if (!this.ledger.hasOwnProperty(key)) continue;
					const ledgerKey = key as keyof Ledger;
					await this.setRemoteLedger(
						ledgerKey,
						this.ledger[ledgerKey]
					);
				}
			} else {
				for (let prop of props) {
					await this.setRemoteLedger(
						prop,
						this.ledger![prop]
					);
				}
			}
			console.log("更新账本", this.ledger);
			return true;
		} catch (error) {
			console.log("updateRemoteLedger", error);
			return false;
		}
	}

	// users
	async createUser(userId: Email, password: string) {
		if (this.ledger?.users[userId]) return;
		if (!this.ledger?.users) this.ledger!.users = {};
		this.ledger!.users[userId] = {
			password,
			createTime: Date.now(),
			evidenceFieldEncryptionMap: {
				name: "clear",
				type: "clear",
				encryption: "clear",
				createTime: "clear",
				size: "clear",
				description: "clear",
				extension: "clear",
			},
		};
		await this.updateRemoteLedger(["users"]);
	}
	getUser(userId: Email) {
		return this.ledger?.users[userId];
	}
	async updateUser(userId: Email, newUser: User) {
		if (!this.ledger?.users[userId]) return;
		if (!this.ledger?.users) this.ledger!.users = {};
		this.ledger.users[userId] = newUser;
		await this.updateRemoteLedger(["users"]);
	}

	// evidences
	async createEvidences(
		files: Express.Multer.File[],
		meta: {
			creatorId: Email;
			type: EvidenceType;
			description: string;
			encryption: EvidenceEncryption;
			isPrivate: 0 | 1;
		}
	) {
		const user = fabric.getUser(meta.creatorId);
		if (!user) return;
		const evidences: Evidence[] = files?.map((file) => {
			const { buffer, size } = file;
			const originalname = Buffer.from(
				file.originalname,
				"latin1"
			).toString("utf8");
			const createTime = Date.now();
			const updateTime = createTime;
			const [name, extension] = splitFileName(originalname);
			writeEncryptedFile(
				path.resolve(
					`upload/${meta.creatorId}-${createTime}-${originalname}`
				),
				buffer,
				"AES"
			);
			const evidence: Evidence = {
				id: fabric.getEvidenceId(),
				name,
				size,
				extension,
				createTime,
				updateTime,
				isDelete: 0,
				...meta,
			};
			cryptography.encrypt.evidence(
				evidence,
				user.evidenceFieldEncryptionMap
			);
			return evidence;
		});
		this.ledger?.evidences.push(...evidences);
		await this.updateRemoteLedger(["evidences", "meta"]);
	}
	async deleteEvidence(id: number) {
		const evidence = this.getEvidence(id);
		if (!evidence) return;
		evidence.isDelete = 1;
		await this.updateRemoteLedger(["evidences", "meta"]);
	}
	async updateEvidence(
		id: number,
		newEvidence: Partial<Evidence>
	) {
		const evidence = this.getEvidence(id);
		if (!evidence) return;
		for (let key in newEvidence) {
			// @ts-ignore
			const newValue = newEvidence[key];
			if (newValue === undefined || newValue === null) {
				continue;
			}
			// @ts-ignore
			evidence[key] = newValue;
		}
		await this.updateRemoteLedger(["evidences"]);
	}
	async addEvidenceAccess(
		evidenceId: number,
		userId: Email,
		applyType: ApplyType
	) {
		const evidence = this.getEvidence(evidenceId);
		if (!evidence) {
			return;
		}
		if (!evidence.access) {
			evidence.access = {};
		}
		if (!evidence.access[userId]) {
			evidence.access[userId] = [applyType];
		} else {
			evidence.access[userId].push(applyType);
		}
	}
	getEvidenceId() {
		const id = this.ledger!.meta.evidence.num;
		this.ledger!.meta.evidence.num++;
		return id;
	}
	getEvidence(id: number) {
		return this.ledger?.evidences.find(
			(item) => item.id === id
		);
	}
	getEvidences(userId: Email) {
		return this.ledger?.evidences.filter(
			(e) => e.creatorId === userId
		);
	}
	getAllEvidences() {
		const res = [];
		for (let userId in this.ledger?.users) {
			const user = this.ledger?.users[userId];
			const validEvidences = this.getEvidences(
				userId
			)?.filter((e) => !e.isPrivate && !e.isDelete);
			if (validEvidences) {
				res.push({
					creator: userId,
					evidences: validEvidences,
					fieldEncryption: user?.evidenceFieldEncryptionMap,
				});
			}
		}
		return res;
	}
	async encryptEvidences(
		userId: Email,
		newEncryptionMap: EvidenceFieldEncryptionMap
	) {
		const creator = this.getUser(userId);
		if (!creator) {
			return false;
		}
		const evidences = this.getEvidences(userId);
		if (!evidences) {
			return false;
		}
		evidences.forEach((e) => {
			cryptography.encrypt.evidence(
				e,
				newEncryptionMap,
				creator.evidenceFieldEncryptionMap
			);
		});
		creator.evidenceFieldEncryptionMap = newEncryptionMap;
		await this.updateRemoteLedger(["users", "evidences"]);
	}
	decryptEvidencesField(
		id: number,
		field: keyof EvidenceFieldEncryptionMap,
		applicantId?: Email
	) {
		const evidence = this.getEvidence(id);
		if (!evidence) {
			return false;
		}
		// 鉴权
		if (false) {
			return false;
		}
		const creator = this.getUser(evidence.creatorId);
		if (!creator) {
			return false;
		}
		return cryptography.decrypt.text(
			creator.evidenceFieldEncryptionMap[field] ?? "clear",
			evidence[field]
		);
	}

	// application
	getApplicationId() {
		const id = this.ledger!.meta.application.num;
		this.ledger!.meta.application.num++;
		return id;
	}
	getApplication(id: number) {
		return this.ledger?.applications.find(
			(a) => a.id === id
		);
	}
	shouldCreateApplication(
		applicantId: Email,
		evidenceId: number
	) {
		const applications =
			fabric.getApplicantsApplications(applicantId);
		if (
			applications &&
			applications.find((a) => {
				const applyType = a.type;

				const hasApply = a.evidenceId === evidenceId;
				const notDone = a.done === 0;
				const evidence = this.getEvidence(a.evidenceId);
				const access =
					evidence?.access?.[applicantId] ?? [];

				const notExpire =
					a.code === 1 && a.expire && a.expire > Date.now();
				return (
					hasApply &&
					(!access.includes(applyType) || notDone)
				);
			})
		) {
			return false;
		}
		return true;
	}
	async createApplication(
		applicantId: Email,
		evidenceId: number,
		type: ApplyType
	) {
		const evidence = this.getEvidence(evidenceId);
		if (!evidence) {
			return;
		}
		const application: Application = {
			id: this.getApplicationId(),
			done: 0,
			applicantId,
			transactorId: evidence?.creatorId,
			type,
			evidenceId,
			createTime: Date.now(),
		};
		this.ledger?.applications.push(application);
		await this.updateRemoteLedger(["applications", "meta"]);
	}
	getApplicantsApplications(userId: Email) {
		return this.ledger?.applications.filter(
			(a) => a.applicantId === userId
		);
	}
	getTransactorsApplications(userId: Email) {
		return this.ledger?.applications.filter(
			(a) => a.transactorId === userId
		);
	}
	async updateApplication(
		applicationId: number,
		code: Status,
		expire?: number
	) {
		// 更新application
		const application = this.getApplication(applicationId);
		if (!application) return false;
		application.done = 1;
		application.endTime = Date.now();
		application.code = code;
		if (!code) return false;
		application.expire = expire;

		// 更新 evidence
		this.addEvidenceAccess(
			application.evidenceId,
			application.applicantId,
			application.type
		);
		return await this.updateRemoteLedger([
			"applications",
			"evidences",
		]);
	}
}

const fabric = new Fabric();

export default fabric;
