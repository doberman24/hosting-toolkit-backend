import {dnsDataType, nameserversType, nsCneckType, RecordsType, Statuses } from "../types/dns.type";

export const getValidStatusDNS = (dnsData: dnsDataType) => {
    const {status, ttl, ...clearStatuses} = dnsData;
    const statuses: Statuses = Object.entries(clearStatuses).reduce((acc, [key, value]) => {
        acc[key as keyof Statuses] = value.status;
        return acc;
    }, {} as Statuses);

    if (statuses.aRecords !== 'ok') {
        if ((statuses.aaaaRecords === 'ok' || statuses.aRecords === 'ENODATA') && statuses.nameservers !== 'undefined') {
            dnsData.aRecords.status = 'empty';
        } else {
            dnsData.aRecords.status = 'not_found';
        }
    }

    if (statuses.aaaaRecords !== 'ok') {
        if ((statuses.aRecords === 'ok' || statuses.aaaaRecords === 'ENODATA') && statuses.nameservers !== 'undefined') {
            dnsData.aaaaRecords.status = 'empty';
        } else {
            dnsData.aaaaRecords.status = 'not_found';
        }
    }

    if (statuses.nameservers !== 'ok') {
        if (statuses.nameservers === 'not_correct' || statuses.nameservers === 'few_ns' || statuses.nameservers === 'undefined') {
            dnsData.nameservers.status = statuses.nameservers;
        } else 
            if (statuses.aRecords === 'ok' || statuses.aaaaRecords === 'ok' || statuses.nameservers === 'ENODATA') {
            dnsData.nameservers.status = 'empty';
        } else {
            dnsData.nameservers.status = 'undefined';
        }
    }
    if (!dnsData.ttl.data){
        if (statuses.nameservers !== 'ok' && statuses.aRecords !== 'ok' && statuses.aaaaRecords !== 'ok') dnsData.ttl.status = 'error';
        console.log(dnsData.ttl);
    }
    return dnsData;
}

export const nsParsing = (nsList: nsCneckType[]) => {
    const result: {data: (string | nsCneckType)[], status: string} = {data: [], status: 'ok'};
    result.data = nsList.reduce((acc: (string | nsCneckType)[], item) => {
        const value = Object.values(item)[0] as string;
        const key = Object.keys(item)[0] as string;
        if (value  === 'ok') {
            acc.push(key);
            return acc;
        }
        if (Array.isArray(value)) {
            acc.push(item);
            result.status = 'not_correct';
            return acc;
        }
        acc.push({[key]: 'not_resolve'});
        result.status = 'not_correct';
        return acc;
    }, [])

    if (result.data.every(item => Object.values(item)[0] === 'not_resolve')) result.status = 'undefined';
    else if (result.data.length < 2) result.status = 'few_ns';

    return result;
}

export const checkNSRecords = (nsRecords: nameserversType[]): nsCneckType[] => {

    let soaRefer: number | null = null;
    let setNsResolveMain: Set<string> = new Set();
    const nsChek = nsRecords.reduce((acc: nsCneckType[], item) => {    
        const nsKey = Object.keys(item)[0];
        if (!nsKey || !item[nsKey]) return acc; 
        if ('error' in item[nsKey]) {
            acc.push({[nsKey]: item[nsKey].error})
            return acc;
        } 
        
        if (!setNsResolveMain.size) {
            setNsResolveMain = new Set(item[nsKey].nsResolveDomain);
        }
        if (!soaRefer) {
            soaRefer = item[nsKey].soa;
        }
        
        const setNsResolveSec = new Set(item[nsKey].nsResolveDomain);

        const warnings = [];
        const warningSoa = item[nsKey].soa !== soaRefer ? 'warning_soa' : '';
        const warningResolve = setNsResolveMain.size !== setNsResolveSec.size || ![...setNsResolveMain].every(ip => setNsResolveSec.has(ip)) ? 'warning_resolve' : '';
        if (warningSoa) warnings.push(warningSoa);
        if (warningResolve) warnings.push(warningResolve);

        acc.push({[nsKey]: warnings.length ? warnings : 'ok'});                    
        
        return acc;
    }, [])
    soaRefer = null;
    setNsResolveMain = new Set();

    return nsChek;
}

