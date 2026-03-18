import { DetailedPeerCertificate } from "node:tls";
import { errorSSLtype, getSSLType, SslDataType, SslType } from "../types/ssl.types";
const tls = require('tls');

module.exports = class CheckSslService {
    
    async tlsConnect(domain: string): Promise<getSSLType> {
        return new Promise((resolve, reject) => {
            const socket = tls.connect({
                host: domain,
                port: 443,
                servername: domain,
                rejectUnauthorized: false
            });

            socket.on('secureConnect', () => {
                const cert: DetailedPeerCertificate = socket.getPeerCertificate(true);
                const protocol: string = socket.getProtocol();
                const auth = socket.authorized;
                const authError = socket.authorizationError;
                socket.end();
                resolve({cert, protocol, auth, authError});
            })

            socket.on('error', (err: any) => {
                reject(err);
            });

            socket.setTimeout(5000);
            socket.on('timeout', () => {
                socket.destroy();
                reject({code: 'ETIMEOUT'});
            })

        });
    }

    async checkSSLData(domain: string): Promise<unknown> {
        try {
            const sslData: getSSLType = await this.tlsConnect(domain);
            console.log('\n############################');
            const result = this.buildSslData(sslData)
            // console.log(result);
            return result;
        } catch (error: any) {
            throw(this.errorStatusData(error.code));
        }
    }

    errorStatusData(error: string) {
        console.log(error);
        return {
            status: 'error',
            certificate: {data: null, status: 'undefined'},
            issuer: {data: null, status: 'undefined'},
            validFrom: {data: null, status: 'undefined'},
            validTo: {data: null, status: 'undefined'},
            daysRemaining: {data: null, status: 'undefined'},
            protocol: {data: null, status: 'undefined'},
        }
    }

    buildSslData({cert, protocol, auth, authError}: getSSLType) {
        const ssl = {} as SslType;
        ssl.issuer = this.formatSslIssuer(cert.issuer.O, auth, authError);
        ssl.validFrom = this.transformDateData(cert.valid_from, 'from');
        ssl.validTo = this.transformDateData(cert.valid_to, 'to');
        ssl.daysRemaining = this.calculateDaysRemaining(cert.valid_to);
        ssl.protocol = this.getProtocol(protocol);
        
        if (Object.values(ssl).some(item => item.status !== 'ok')) {
            ssl.status = Object.values(ssl).every(item => item.status === 'undefined') ? 'error' : 'warning';
        } else ssl.status = 'ok';
        
        return ssl;
    }

    formatSslIssuer(data: string | string[] | undefined, auth: boolean, authError: string) {
        console.log(auth, authError);
        if (!data) return {data: null, status: 'empty'};
        const formatData = {data: data, status: 'ok'};
        if (!auth) {
            formatData.status = 
                authError === 'DEPTH_ZERO_SELF_SIGNED_CERT' ? 'self_signed' 
                : authError === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ? 'broken_chain' 
                : 'invalid_domain'
        }
        return formatData;
    }

    getProtocol(data: string) {
        if (!data) return {data: null, status: 'empty'};
        return  {data: data, status: 'ok'};
    }

    calculateDaysRemaining(validTo: string) {
        if (!validTo) return {data: null, status: 'empty'};

        const remaindTo = new Date(validTo);
        const today = new Date();
        const remainingDays = Math.floor((remaindTo.getTime() - today.getTime()) / (24 * 3600 * 1000));

        if (remainingDays < 0) {
            return {data: String(remainingDays), status: 'expire'};
        }
        if (remainingDays < 20) {
            return {data: String(remainingDays), status: remainingDays > 7 ? 'low_days' : 'critical_low'};
        }

        return {data: String(remainingDays), status: 'ok'};
    }

    transformDateData(date: string, type: 'to' | 'from') {
        if (!date) {
            return {data: null, status: 'empty'};
        }
        const formattedDate = new Date(date);
        const nowDate = new Date();
        if (type === 'to') {
            return {data: formattedDate.toISOString(), status: formattedDate >= nowDate ? 'ok' : 'expire'};
        }
        if (type === 'from') {
            return {data: formattedDate.toISOString(), status: formattedDate <= nowDate ? 'ok' : 'too_early'};
        }
        return {data: null, status: 'undefined'};
    }

}