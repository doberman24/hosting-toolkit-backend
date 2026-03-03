export type CorsType = {
    origin: string,
    credentials: boolean,
}

export interface IApp {
    listen(): void;    
}