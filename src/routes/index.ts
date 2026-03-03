import type { Router as RouterType } from "express";
import { ICheckDomain } from "../types/server.types";
const { Router } = require('express');
const CheckDomain = require('./checkDomain.routes');

module.exports = class Routes {
    private router: RouterType;
    private checkDomain: ICheckDomain;
     
    constructor() {
        this.router = Router()
        this.checkDomain = new CheckDomain(this.router);
        this.initRoutes();
    }

    private initRoutes(): void {
        this.checkDomain.initCheckRoute();
    }
};