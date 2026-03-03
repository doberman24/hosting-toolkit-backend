import { Router } from "express";
import { ICheckDomain, ICheckDomainController } from "../types/server.types";
const CheckDomainController = require('../controllers/checkDomain.controller');

module.exports = class CheckDomain implements ICheckDomain {
  private router: Router;
  private checkDomainController: ICheckDomainController;

  constructor(router: Router) {
    this.router = router;
    this.checkDomainController = new CheckDomainController();
  }

  initCheckRoute(): void {
    this.router.get('/check-domain', this.checkDomainController.checkDomainResolve.bind(this.checkDomainController));
  }
}