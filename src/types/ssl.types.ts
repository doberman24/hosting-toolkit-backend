import { DetailedPeerCertificate } from "node:tls";

export type getSSLType = {
    cert: DetailedPeerCertificate,
    protocol: string
    auth: boolean,
    authError: string
};

export type errorSSLtype = {
  error: string;
}

export interface SslType {
      status?: string,
      certificate: SslDataType<string | null>,
      issuer: SslDataType<string | string[] | null>,
      validFrom: SslDataType<string | null>,
      validTo: SslDataType<string | null>,
      daysRemaining?: SslDataType<string | null>,
      protocol: SslDataType<string | string[] | null>
}

export type SslDataType<T> = {
  data: T,
  status: string
} 