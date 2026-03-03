import { Request, Response } from 'express';

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
    checkDomainResolve(req: Request, res: Response): Promise<void>;
}

export interface ICheckDomainService {
    checkDomainData(domain: string): string
}