export const errorStatusData = (error: string) => {
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