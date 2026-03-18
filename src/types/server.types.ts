import { NextFunction, Request, Response } from 'express';
import { dnsDataType, nameserversType, RecordsType } from './dns.type';
import type { Resolver as ResolverType } from 'dns/promises';

export type CorsType = {
    origin: string,
    credentials: boolean,
}

export interface IApp {
    listen(): void;    
}

export interface ICheckDomain {
    initCheckRoute(): void;
}

export interface ICheckDomainController {
    checkDomainResolve(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface ICheckDnsService {
    checkDNSData(domain: string): Promise<dnsDataType>, 
}

export interface IDomainResultService {
    getMainResult(domain: string): Promise<unknown>
}

export interface ICheckSslServise {
    checkSSLData(domain: string): Promise<unknown>
}