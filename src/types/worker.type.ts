export type RecordsType = {
    data: string[] | number | null,
    ttl?: number | null,
    status: string
}

export type Statuses = {
    aRecords: string,
    aaaaRecords: string,
    nameservers: string,
}

export interface dnsDataType {
    status?: string,
    aRecords: RecordsType,
    aaaaRecords: RecordsType,
    ttl: RecordsType,
    nameservers: RecordsType
}

export interface nsDataResolve {
    nsResolveDomain: string[],
    soa: number | null,
    nsAList: string[]
}
export interface nsErrorType {
    error: string
}
export interface nsCneckType {
    [nameservers: string]: string | string[]
}

export type nameserversType = {
    [nameservers: string]: nsDataResolve | nsErrorType
}