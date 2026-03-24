export interface httpResponseType {
    url: string,
    statusCode: number,
    redirectUrls: string[],
    timings: {response: number, start: number, upload: number},
}

export type httpDataType<T> = {
    data: T,
    status: string,
}

export interface httpType {
    status: string,
    statusCode: httpDataType<number | null>,
    redirectUrls: httpDataType<number | string>,
    responseTimeMs: httpDataType<number | null>,
    ttfbMs: httpDataType<number | null>,
    serverTimeMs: httpDataType<number | null>,
    finalUrl: httpDataType<string | null>,
}