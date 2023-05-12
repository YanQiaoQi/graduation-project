import { createContext } from 'react';

import type { User } from './hooks';

export const UserContext = createContext<User>({ email: undefined });
