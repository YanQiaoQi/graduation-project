import { IEnrollResponse } from "fabric-ca-client";
import { Wallets, X509Identity } from "fabric-network";
import { walletPath } from "../common";

export async function get() {
	const wallet = await Wallets.newFileSystemWallet(
		walletPath
	);
	return wallet;
}

type WalletPutArgus = {
	enrollment: IEnrollResponse;
	mspId?: string;
	id: string;
};

class MyWallet {
	// @ts-ignore
	wallet: Wallet;
	constructor() {}
	async init() {
		if (!!this.wallet) return;
		this.wallet = await Wallets.newFileSystemWallet(
			walletPath
		);
	}
	async put({
		enrollment,
		mspId = "Org1MSP",
		id,
	}: WalletPutArgus) {
		try {
			const x509Identity: X509Identity = {
				credentials: {
					certificate: enrollment.certificate,
					privateKey: enrollment.key.toBytes(),
				},
				mspId: mspId,
				type: "X.509",
			};
			await this.wallet.put(id, x509Identity);
			console.log(
				`Successfully enrolled admin user "${id}" and imported it into the wallet`
			);
		} catch (e) {
			console.log(
				`Failed enrolled admin user "${id}": ${e}`
			);
		}
	}
	async isExist(id: string) {
		// Check to see if we've already enrolled the admin user.
		const identity = await this.getIdentity(id);
		if (identity) {
			console.log(
				`An identity for the admin user "${id}" already exists in the wallet`
			);
			return true;
		}
		return false;
	}
	async getIdentity(id: string) {
		return await this.wallet.get(id);
	}
	async getUser(id: string) {
		if (await this.isExist(id)) {
			const adminIdentity = await this.getIdentity(id);
			const provider = this.wallet
				.getProviderRegistry()
				.getProvider(adminIdentity.type);
			const adminUser = await provider.getUserContext(
				adminIdentity,
				id
			);
			return adminUser;
		}
	}
}

const wallet = new MyWallet();

export default wallet;
