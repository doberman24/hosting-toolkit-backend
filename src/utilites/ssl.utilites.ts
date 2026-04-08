import { SslType } from "../types/ssl.types";

const errorStatusSSLData = (error: string): SslType => {
    console.log(error);
    return {
        status: 'error',
        issuer: {data: null, status: 'undefined'},
        validFrom: {data: null, status: 'undefined'},
        validTo: {data: null, status: 'undefined'},
        daysRemaining: {data: null, status: 'undefined'},
        protocol: {data: null, status: 'undefined'},
    }
}

export = { errorStatusSSLData };