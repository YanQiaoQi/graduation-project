import { Gateway } from "fabric-network";
import { ccp } from "../common";
import wallet from "./wallet";

class MyGateway {
	gateway: Gateway;
	isInit: boolean;
	constructor() {
		this.gateway = new Gateway();
		this.isInit = false;
	}
	async init(id: string) {
		await wallet.init();
		if (!this.isInit) {
			await this.gateway.connect(ccp, {
				wallet: wallet.wallet,
				identity: id,
				// discovery: { enabled: true, asLocalhost: true },
			});
			this.isInit = true;
		}
	}
	async getContract(channel: string, ccname: string) {
		const network = await this.gateway.getNetwork(channel);
		const contract = network.getContract(ccname);
		return contract;
	}
	async disconnect() {
		await this.gateway.disconnect();
	}
}

const gateway = new MyGateway();

export default gateway;
