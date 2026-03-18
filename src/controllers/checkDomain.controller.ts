import { NextFunction, Request, Response } from 'express';
import { ICheckDomainController, IDomainResultService } from '../types/server.types';
const DomainResultService = require('../services/domainResultService')

module.exports = class CheckDomainController implements ICheckDomainController {
    private domainResultService: IDomainResultService;

    constructor() {
        this.domainResultService = new DomainResultService();
    };

    async checkDomainResolve(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {domain} = req.query as {domain?: string};
        if (!domain) {
            res.status(401).json({error: 'Заполните все поля'});
            return;
        }
        try {
            const result = await this.domainResultService.getMainResult(domain);
            res.status(200).json(result);
            return;
        } catch(error) {
            next(error);
        }
    };
}