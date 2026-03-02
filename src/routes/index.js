const { Router } = require('express');
const CheckDomain = require('./checkDomain.routes');

module.exports = class Routes {
    constructor() {
        this.router = Router()
        this.checkDomain = new CheckDomain(this.router);
        this.initRoutes();
    }

    initRoutes() {
        this.checkDomain.initCheckRoute();
    }
};