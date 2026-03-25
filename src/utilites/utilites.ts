import { httpType } from "../types/http.types";

const addStatus = <T extends Record<string, {status: string}>>(data: T, statusList: string[]) => {
    if (Object.values(data).some(item => item.status !== 'ok')) {
        return Object.values(data).every(item => statusList.includes(item.status)) ? 'error' : 'warning';
    }
    return 'ok';
}

module.exports = { addStatus };