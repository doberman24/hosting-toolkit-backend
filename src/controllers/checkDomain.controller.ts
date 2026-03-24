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
        const domainRegex = /^(?!-)[a-zа-яё0-9-]{1,63}(?<!-)(\.[a-zа-яё0-9-]{1,63})*\.?$/;
        if (!domain) {
            res.status(400).json({error: 'Заполните все поля'});
            return;
        }
        if (!domainRegex.test(domain)) {
            res.status(400).json({error: 'Неверный формат домена'});
            return;
        }
        try {
            const normalizedDomain = domain.toLowerCase().trim().replace(/^www\./, '');
            const result = await this.domainResultService.getMainResult(normalizedDomain);
            res.status(200).json(result);
            return;
        } catch(error) {
            next(error);
        }
    };
}