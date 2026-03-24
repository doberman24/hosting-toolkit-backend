import { NextFunction, Request, Response } from 'express';
import { dnsDataType } from './dns.type';

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

export interface ICheckHttpServise {
    checkHTTPData(domain: string): unknown
}