import { ICheckDomainService } from "../types/server.types";

module.exports = class CheckDomainService implements ICheckDomainService {
    
    checkDomainData(domain: string): string {
        return `From service ${domain}`;
    }
}