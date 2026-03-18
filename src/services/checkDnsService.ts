import { ICheckDnsService } from "../types/server.types";
import type { Resolver as ResolverType } from 'dns/promises';
import {dnsDataType, nameserversType, nsCneckType, RecordsType, Statuses } from "../types/dns.type";
const { Resolver } = require('dns/promises');

module.exports = class CheckDnsService implements ICheckDnsService {
    private resolver: ResolverType;
    constructor () {
        this.resolver = new Resolver();
        this.resolver.setServers(['1.1.1.1', '8.8.8.8']);
    }

    async checkDNSData(domain: string): Promise<dnsDataType> {

        try {
            const dnsCollection: RecordsType[] = await Promise.allSettled([
                this.getARecords(this.resolver, domain, 'a'), 
                this.getARecords(this.resolver, domain, 'aaaa'),
                this.getNSRecords(this.resolver, domain)
            ])
            .then(result => result.map(item => {
                if (item.status === 'fulfilled') {
                    return item.value;
                } else {
                    return item.reason;
                }
            }));
            const dnsResult = this.buildData(dnsCollection);
            return dnsResult;
        } catch(error: any) {
            throw `This Error in service: ${error}`;
        }
    };

    private async getARecords (resolver: ResolverType, domain: string, type: 'a' | 'aaaa'): Promise<{aRecods?: RecordsType, aaaaRecords?: RecordsType}> {
        try {
            let minTtl = 0;
            const resultA = await (type === 'aaaa'
            ? resolver.resolve6(domain, {ttl: true}) 
            : resolver.resolve4(domain, {ttl: true}))
            .then(resultList => resultList.map(record => {
                if (record.ttl < minTtl || minTtl === 0) {
                    minTtl = record.ttl;
                }
                return record.address;
            }));
            const recordType = type === 'aaaa' ? 'aaaaRecords' : 'aRecords';
            const ttlInclude = type === 'a';

            return {[recordType]: {data: resultA, ...(ttlInclude && {ttl: minTtl}), status: 'ok'}};
        } catch(error: any) {
            const recordType = type === 'aaaa' ? 'aaaaRecords' : 'aRecords';
            const ttlInclude = type === 'a';
            throw {[recordType]: {data: [], ...(ttlInclude && {ttl: null}), status: error.code}};
        }
    };

    private async getNSRecords (resolver: ResolverType, domain: string) {
        try {
            const nsList: string[] = await resolver.resolveNs(domain);
            // const nsListFake = ['ns1.example.com', 'ns1.beget.pro', 'ns2.beget.com', 'dns.google', 'ns1.beget.com'];

            const paramListNS = await Promise.allSettled(nsList.map(async (record: string) => {
                
                const aRecNS = await resolver.resolve4(record);
                const nsResolver: ResolverType = new Resolver();
                nsResolver.setServers(aRecNS);

                const nsCheckResolve = await nsResolver.resolve4(domain);
                const soa = await nsResolver.resolveSoa(domain);

                return {[record]: {nsResolveDomain: nsCheckResolve, soa: soa.serial, nsAList: aRecNS}};
            }))
            .then(result => result.map((item) => {
                if (item.status === 'fulfilled') {
                    return item.value;
                } else {
                    return {[item.reason.hostname]: {error: item.reason.code}};
                }
            }));

            const checkNSList = this.checkNSRecords(paramListNS);
            const parsingNSList = this.nsParsing(checkNSList);

            return {nameservers: parsingNSList};
        } catch(error: any) {
            throw {nameservers: {data: [], status: error.code}};
        }
    };

    private buildData(unformatedData: RecordsType[]) {
        const dnsData: dnsDataType = {} as dnsDataType;
        unformatedData.forEach(item => {
            Object.assign(dnsData, item);
        });

        if (!dnsData.aRecords.ttl) {
            dnsData.ttl = {data: null, status: 'empty'};
        } else {
            dnsData.ttl = {data: dnsData.aRecords.ttl, status: dnsData.aRecords.ttl >= 60 && dnsData.aRecords.ttl <= 86400 ? 'ok' : 'warning_status'} 
        }

        const {ttl, ...aRecords} = dnsData.aRecords;
        dnsData.aRecords = aRecords;

        return this.getValidStatusDNS(dnsData);
        // console.dir(dnsData, {depth: null});
    }


    private getValidStatusDNS(dnsData: dnsDataType) {
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
        // console.dir(dnsData, { depth: null });
        return dnsData;
    }

    private nsParsing (nsList: nsCneckType[]) {
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

    private checkNSRecords(nsRecords: nameserversType[]): nsCneckType[] {

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

}