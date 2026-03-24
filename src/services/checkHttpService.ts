import { httpDataType, httpResponseType, httpType } from "../types/http.types";
const { default: got } = require('got');
const { errorTooManyRedirects, errorStatusHTTPData } = require('../utilites/http.utilites')

module.exports = class CheckHttpService {
    
    async checkHTTPData(domain: string) {
        const start = Date.now();
        try {
            const http: httpResponseType = await got(
                `http://${domain}`, {
                    followRedirect: true,
                    // maxRedirects: 50,
                    https: {
                        rejectUnauthorized: false
                    },
                    timeout: {
                        lookup: 2000,
                        connect: 2000,
                        secureConnect: 3000,
                        response: 3000,
                        request: 7000
                    }
                }
            );
            const end = Date.now();
            console.log('---------------------------');
            const httpResult = this.buildData(http, start, end, domain);
            console.log(httpResult);
            
        } catch (error: any) {
            if (error.code === 'ERR_TOO_MANY_REDIRECTS') {
                return errorTooManyRedirects(error, this.checkStatusCode);
            }
            const end = Date.now();
            if (error.response) {
                const httpResult = this.buildData(error.response, start, end, domain);
                httpResult.status = 'error';
                return httpResult;
            } else {
                throw(errorStatusHTTPData(error.code));
            }
        }
    }
    
    buildData(http: httpResponseType, start: number, end: number, domain: string) {
        const httpData = {} as httpType;
        httpData.statusCode = this.checkStatusCode(http.statusCode);
        httpData.redirectUrls = this.calculateRedirects(http.redirectUrls.length);
        httpData.finalUrl = this.getUrl(http.url, domain);
        httpData.responseTimeMs = this.parsingTimings(end - start, 'responseTimeMs');
        httpData.ttfbMs = this.parsingTimings(http.timings.response - http.timings.start, 'ttfmbMs');
        httpData.serverTimeMs = this.parsingTimings(http.timings.response - http.timings.upload, 'serverTimeMs');

        return httpData;
    }

    getUrl(url: string, domain: string): httpDataType<string | null> {
        if (!url) return {data: null, status: 'empty'};
        
        if (new URL(url).hostname !== domain) {
            const normalizedUrl = new URL(url).hostname.replace(/^www\./, '');
            if (normalizedUrl !== domain) return {data: url, status: 'another_site'} 
        }
        if (!url.includes('https')) return {data: url, status: 'not_protected'};

        return {data: url, status: 'ok'};
    }

    checkStatusCode(code: number): httpDataType<number | null> {
        if (!code) return {data: null, status: 'empty'};
        if (code > 499) return {data: code, status: 'error_5xx'};
        if (code > 399) return {data: code, status: 'error_4xx'};

        return {data: code, status: 'ok'};
    }

    calculateRedirects(num: number): httpDataType<number | string> {
        if (!num && num !== 0) return {data: 'Нет', status: 'ok'};
        if (num === 0) return {data: 'Нет', status: 'ok'};
        if (num <= 2) return {data: num, status: 'ok'};        
        if (num < 5) return {data: num, status: 'excessive_redirects'};

        return {data: num, status: 'too_many_redirects'};
    }

    parsingTimings(timeMs: number, type: 'responseTimeMs' | 'ttfmbMs' | 'serverTimeMs'): httpDataType<number | null> {
        if (!timeMs && timeMs !== 0) return {data: null, status: 'empty'};
        
        const timings = { 
            responseTimeMs: {slow: 1000, critical: 2000},
            ttfmbMs: {slow: 500, critical: 1000},
            serverTimeMs: {slow: 300, critical: 700}
        }
        const {slow, critical} = timings[type];
        
        if (timeMs > critical) return {data: timeMs, status: 'critical'};
        if (timeMs > slow) return {data: timeMs, status: 'slow'};
        return {data: timeMs, status: 'ok'};
    }
}
