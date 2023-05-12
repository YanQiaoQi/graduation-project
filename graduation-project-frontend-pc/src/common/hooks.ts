import { useState } from 'react';

export type User = {
    email: string | undefined;
};

export function useUser() {
    const [user, setUser] = useState<User>({
        email: undefined,
    });
    function update(values: Partial<User>) {
        setUser({ ...user, ...values });
    }
    return [user, update] as [User, (values: Partial<User>) => void];
}
