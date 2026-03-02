module.exports = class CheckDomainController {
    constructor() {
        // this.authService = new AuthService();
    };

    async checkDomainResolve(req, res) {
        const {domain} = req.query;
        if (!domain) {
            return res.status(401).json({error: 'Заполните все поля'});
        }
        return res.status(200).json({success: domain});
    };
}