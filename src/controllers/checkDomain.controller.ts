import { Request, Response } from 'express';

module.exports = class CheckDomainController {
    constructor() {
        // this.authService = new AuthService();
    };

    async checkDomainResolve(req: Request, res: Response): Promise<void> {
        const {domain} = req.query as {domain?: string};
        if (!domain) {
            res.status(401).json({error: 'Заполните все поля'});
            return;
        }
        res.status(200).json({success: domain});
        return;
    };
}