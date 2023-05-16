export type Email = string;

export type User = {
    
};

export type Users = Record<Email, User>;

export type Evidence = {};

export type Ledger = {
	users: Users;
	evidences: Evidence[];
};
