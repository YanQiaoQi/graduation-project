import { useState } from 'react';
import useRequest from '@ahooksjs/use-request';
import { isAuthorized } from '@/service/user';

export type User = {
    email?: string;
};

export function useUser() {
    return useRequest(isAuthorized);
}
