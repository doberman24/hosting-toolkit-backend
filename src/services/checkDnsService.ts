import { ICheckDnsService } from "../types/server.types";
import type { Resolver as ResolverType } from 'dns/promises';
import {dnsDataType, RecordsType, } from "../types/dns.type";
const { checkNSRecords, getValidStatusDNS, nsParsing } = require("../utilites/dns.utilites");
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
            this.getStatusDns(dnsResult);
            // console.log(dnsWithStatus);
            return dnsResult;
        } catch(error: any) {
            throw `This Error in service: ${error}`;
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

        return getValidStatusDNS(dnsData);
    }


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
                try {
                    const aRecNS = await resolver.resolve4(record);
                    const nsResolver: ResolverType = new Resolver();
                    nsResolver.setServers(aRecNS);

                    const nsCheckResolve = await nsResolver.resolve4(domain);

                    const soa = await nsResolver.resolveSoa(domain);

                    return {[record]: {nsResolveDomain: nsCheckResolve, soa: soa.serial, nsAList: aRecNS}};
                } catch (err: any) {
                    throw {...err, nsRecord: record}
                }
            }))
            .then(result => result.map((item) => {
                if (item.status === 'fulfilled') {
                    return item.value;
                } else {
                    const nsRecord = item.reason.nsRecord || item.reason.hostname || 'unknown';
                    return {[nsRecord]: {error: item.reason.code}};
                }
            }));

            console.log(paramListNS);

            const checkNSList = checkNSRecords(paramListNS);
            const parsingNSList = nsParsing(checkNSList);

            return {nameservers: parsingNSList};
        } catch(error: any) {
            throw {nameservers: {data: [], status: error.code}};
        }
    };

    private getStatusDns(dnsData: dnsDataType) {
        dnsData.status = 'ok';
        if (dnsData.ttl.status !== 'ok' && dnsData.ttl.status !== 'warning_status') {
            dnsData.status = dnsData.ttl.status === 'empty' ? 'warning' : 'error';
        }
        if (dnsData.aRecords.status !== 'ok' && dnsData.aaaaRecords.status !== 'ok') 
            dnsData.status = dnsData.aRecords.status === 'empty' ? 'warning' : 'error';
        if (dnsData.nameservers.status !== 'ok') {
            dnsData.status = (dnsData.nameservers.status === 'empty' || dnsData.nameservers.status === 'not_correct') ? 'warning' : 'error';
        }
        return dnsData;
    }

}