import { ICheckDnsService, ICheckSslServise, IDomainResultService } from "../types/server.types";
const CheckDnsService = require('./checkDnsService');
const CheckSslService = require('./checkSslService');

module.exports =  class DomainResultService implements IDomainResultService {
    private checkDnsService: ICheckDnsService;
    private checkSslService: ICheckSslServise;
    constructor() {
        this.checkDnsService = new CheckDnsService();
        this.checkSslService = new CheckSslService();
    }

    async getMainResult(domain: string): Promise<unknown> {
        try {
            const result = await Promise.allSettled([
                this.checkDnsService.checkDNSData(domain),
                this.checkSslService.checkSSLData(domain)
            ])
            .then(res => res.map(item => {
                if (item.status === 'fulfilled') {
                    return item.value;
                } else {
                    return item.reason;
                }
            }));
            return {
                domain: domain,
                checkedAt: new Date(),
                summary: {
                    status: 'warning',
                    score: 82,
                    message: 'Сертификат SSL действителен. DNS настроен корректно. Обнаружены задержки ответа сервера (750мс), что может влиять на производительность.' 
                },
                checks: {
                    dns: result[0],
                    ssl: result[1]
                } 
            }
        } catch (error) {
            // throw(error);
        }
    }
}