import { httpDataType, httpType } from "../types/http.types";

const errorStatusHTTPData = (error: string): httpType => {
  console.log(error);
  return {
    status: 'error',
    statusCode: {data: null, status: 'empty'},
    redirectUrls: {data: 'Нет', status: 'ok'},
    responseTimeMs: {data: null, status: 'empty'},
    ttfbMs: {data: null, status: 'empty'},
    serverTimeMs: {data: null, status: 'empty'},
    finalUrl: {data: null, status: 'empty'},
  }  
}

const errorTooManyRedirects = (error: any, checkStatusCode: (code: number) => httpDataType<number | null>): httpType => {
  return {
    status: 'error',
    statusCode: checkStatusCode(error.response.statusCode),
    redirectUrls: {data: '> 10', status: 'too_many_redirects'},
    responseTimeMs: {data: null, status: 'empty'},
    ttfbMs: {data: null, status: 'empty'},
    serverTimeMs: {data: null, status: 'empty'},
    finalUrl: {data: null, status: 'empty'},
  }
}

module.exports = { errorStatusHTTPData, errorTooManyRedirects };