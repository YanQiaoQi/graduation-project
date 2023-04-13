import FabricCAServices, {
	IRegisterRequest,
} from "fabric-ca-client";
import { CA_DOMAIN, ccp as defaultCcp } from "../common";

type registerArgus = {
	register: any;
	req: IRegisterRequest;
};

type enrollArgus = {
	id: string;
	secret: string;
};

class MyCA {
	ca: FabricCAServices;
	caInfo: any;
	constructor(ccp = defaultCcp) {
		this.caInfo = ccp.certificateAuthorities[CA_DOMAIN];
		const caTLSCACerts = this.caInfo.tlsCACerts.pem;
		const ca = new FabricCAServices(
			this.caInfo.url,
			{ trustedRoots: caTLSCACerts, verify: false },
			this.caInfo.caName
		);
		this.ca = ca;
	}
	get() {
		return this.ca;
	}
	async register({ register, req }: registerArgus) {
		const ca = new FabricCAServices(this.caInfo.url,);
		const secret = await ca.register(req, register);
		return secret;
	}
	async enroll({ id, secret }: enrollArgus) {
		const ca = new FabricCAServices(this.caInfo.url,);
		const enrollment = await ca.enroll({
			enrollmentID: id,
			enrollmentSecret: secret,
		});
		return enrollment;
	}
}

const ca = new MyCA();

export default ca;
