import { Router } from "express";

// const { Router } = require('express');
const CheckDomainController = require('../controllers/checkDomain.controller');

module.exports = class CheckDomain {
  public router: Router;
  checkDomainController: typeof CheckDomainController;

  constructor(router: Router) {
    this.router = router;
    this.checkDomainController = new CheckDomainController();
  }

  initCheckRoute() {
    this.router.get('/check-domain', this.checkDomainController.checkDomainResolve.bind(this.checkDomainController));
  }
}