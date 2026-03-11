import { NextFunction, Request, Response } from 'express';
import { dnsDataType } from './worker.type';

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

export interface ICheckDomainService {
    checkDomainData(domain: string, next: NextFunction): Promise<dnsDataType>;
}