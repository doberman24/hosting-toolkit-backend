const CheckDomainController = require('../controllers/checkDomain.controller');

module.exports = class CheckDomain {
  constructor(router) {
    this.router = router;
    this.checkDomainController = new CheckDomainController();
  }

  initCheckRoute() {
    this.router.get('/check-domain', this.checkDomainController.checkDomainResolve.bind(this.checkDomainController));
  }
}