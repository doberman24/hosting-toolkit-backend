import { NextFunction, Request, Response } from 'express';
import { ICheckDomainController, ICheckDomainService } from '../types/server.types';
const CheckDomainService = require('../services/checkDomainService')

module.exports = class CheckDomainController implements ICheckDomainController {
    private checkDomainService: ICheckDomainService;

    constructor() {
        this.checkDomainService = new CheckDomainService();
    };

    async checkDomainResolve(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {domain} = req.query as {domain?: string};
        if (!domain) {
            res.status(401).json({error: 'Заполните все поля'});
            return;
        }
        try {
            const result = await this.checkDomainService.checkDomainData(domain, next);
            res.status(200).json(result);
            return;
        } catch(error) {
            next(error);
        }
    };
}