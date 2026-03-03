import type { Router as RouterType } from "express";
const { Router } = require('express');
const CheckDomain = require('./checkDomain.routes');

module.exports = class Routes {
    public router: RouterType;
    public checkDomain: typeof CheckDomain;
     
    constructor() {
        this.router = Router()
        this.checkDomain = new CheckDomain(this.router);
        this.initRoutes();
    }

    private initRoutes(): void {
        this.checkDomain.initCheckRoute();
    }
};