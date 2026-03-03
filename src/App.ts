import { Application, NextFunction, Request, Response, ErrorRequestHandler } from "express";
import { CorsType, IApp } from "./types/server.types";
const Routes = require('./routes');
const express = require('express');
const cors = require('cors');

module.exports = class App implements IApp {
    private port: number;
    private host: string;
    private server: Application;
    private corsOptions: CorsType;
    
    constructor(port: number, host: string, url: string, routes: typeof Routes) {
        this.port = port;
        this.host = host;
        this.server = express();
        this.corsOptions = {
            origin: url,
            credentials: true,
        }
        this.initMiddlewares();
        this.initRoutes(routes);
        this.initErrorHandling();
    };

    private initMiddlewares(): void {
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
        this.server.use(cors(this.corsOptions));
    };

    private initRoutes(routes: typeof Routes): void {
        this.server.use('/api', routes.router);
    };

    //обработка ошибок при http-запросе,и возврат ее клиенту
    initErrorHandling(): void {
        this.server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).json({message: 'Internal Server Error'});
        });
    };

    listen(): void {
        this.server.listen(this.port, this.host, err => {
            err ? console.log(err) : console.log(`Listen port ${this.port}`);
        });
    }
}