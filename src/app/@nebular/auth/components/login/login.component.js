import { Component, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NB_AUTH_OPTIONS } from '../../auth.options';
import { getDeepFromObject } from '../../helpers';
import { NbAuthService } from '../../services/auth.service';
import { ApiService } from '../../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Utils } from '../../../../common';

var NbLoginComponent = /** @class */ (function () {
    function NbLoginComponent(service, toastrService, cookieService, config, router, route) {
        if (config === void 0) { config = {}; }
        this.service = service;
        this.toastrService = toastrService;
        this.cookieService = cookieService;
        this.config = config;
        this.router = router;
        this.route = route;
        this.redirectDelay = 0;
        this.showMessages = {};
        this.provider = '';
        this.errors = [];
        this.messages = [];
        this.user = {};
        this.submitted = false;
        this.redirectDelay = this.getConfigValue('forms.login.redirectDelay');
        this.showMessages = this.getConfigValue('forms.login.showMessages');
        this.provider = this.getConfigValue('forms.login.provider');
        let password = this.route.snapshot.params['password'];
        let username = this.route.snapshot.params['username'];
        this.showSignIn = true;

        if (password && username) {
            // username: roxana_manager, encoded username: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.InJveGFuYV9tYW5hZ2VyIg
            // password: pf1234, encoded password: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.InBmMTIzNCI
            if (password.split('.').length > 1 && username.split('.').length > 1) {
                this.showSignIn = false;
                // console.log('showSignIn ' + this.showSignIn);
                // console.log('Login using query in URL');
                username = Utils.decodeJwt(username);
                password = Utils.decodeJwt(password);
                this.signInUser(username, password);

            }
        } else if (this.cookieService.check('user') && this.cookieService.get('user') != '') {
            var user = Utils.decodeJwt(this.cookieService.get('user'));
            this.showSignIn = false;
            this.signInUser(user.username, user.password);
        } 
    }
    NbLoginComponent.prototype.login = function () {
        this.errors = this.messages = [];
        this.submitted = true;
        this.signInUser(this.user.username, this.user.password);
    };
    NbLoginComponent.prototype.signInUser = function(username, password) {
        var _this = this;
        this.service.signInUser(username, password).subscribe(
            res => {
                var success = false;
                var redirect = '/admin/menu';
                // this.showSignIn = true;
                // console.log('showSignIn ' + this.showSignIn);
                if (res) {
                    if (!res.err) {
                        var user = res.response;
                        if (user.role == 0) {
                            _this.cookieService.set('user', Utils.encodeJwt(user), null, '/');
                            redirect = '/client/restaurant';
                            return _this.router.navigateByUrl(redirect);
                        }
                        if (user.role == 3) {
                            // runner dashboard
                            _this.cookieService.set('user', Utils.encodeJwt(user), null, '/');
                            redirect = '/runners/pending';
                            return _this.router.navigateByUrl(redirect);
                        } 
                        _this.fetchRestaurant(user.restaurant_id).then(result => {
                            if (!result['err']) {
                                success = true;
                                if (this.showSignIn) {
                                    _this.toastrService.info('Logged in successfully!');
                                }
                                // save current user
                                user.restaurant = result['response'][0];
                                user.restaurant.bank_account = JSON.parse(user.restaurant.bank_account);
                                // console.log(user);
                                _this.cookieService.set('user', Utils.encodeJwt(user), null, '/');
                                if (user.role == 2) 
                                    redirect = '/frontdesk/pending';
                            } else {
                                _this.toastrService.error('Cannot get restaurant information');
                                _this.submitted = false;
                            }

                            setTimeout(function () {
                                if (!success) {
                                    redirect = '/auth/login';
                                }
                                return _this.router.navigateByUrl(redirect);
                            }, _this.redirectDelay);
                        });
                    } else {
                        _this.toastrService.error('Incorrect username or password, try again');
                        _this.submitted = false;
                    }
                } else {
                    _this.toastrService.error('Incorrect username or password, try again');
                    _this.submitted = false;
                }
            }
        );
    };

    NbLoginComponent.prototype.fetchRestaurant = function(restaurant_id) {
        return new Promise((resolve, reject) => {
            var param1 = -1;
            var param2 = -1;
            this.service.getRestaurant(restaurant_id).subscribe(
                res => {
                    resolve(res);
                }
            );
        });
    };
    NbLoginComponent.prototype.getConfigValue = function (key) {
        return getDeepFromObject(this.config, key, null);
    };
    // NbLoginComponent.decorators = [
    //     { type: Component, args: [{
    //                 selector: 'nb-login',
    //                 template: "\n    <nb-auth-block>\n      <h2 class=\"title\">Sign In</h2>\n      <small class=\"form-text sub-title\">Hello! Sign in with your username</small>\n\n      <form (ngSubmit)=\"login()\" #form=\"ngForm\" autocomplete=\"nope\">\n\n        <div *ngIf=\"showMessages.error && errors && errors.length > 0 && !submitted\"\n             class=\"alert alert-danger\" role=\"alert\">\n          <div><strong>Oh snap!</strong></div>\n          <div *ngFor=\"let error of errors\">{{ error }}</div>\n        </div>\n\n        <div *ngIf=\"showMessages.success && messages && messages.length > 0 && !submitted\"\n             class=\"alert alert-info\" role=\"alert\">\n          <div><strong>Hooray!</strong></div>\n          <div *ngFor=\"let message of messages\">{{ message }}</div>\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-username\" class=\"sr-only\">Username</label>\n          <input name=\"username\" [(ngModel)]=\"user.username\" id=\"input-username\" pattern=\".+\"\n                 class=\"form-control\" placeholder=\"Username\" #username=\"ngModel\"\n                 [class.form-control-danger]=\"username.invalid && username.touched\" autofocus\n                 [required]=\"getConfigValue('forms.validation.email.required')\">\n          <small class=\"form-text error\" *ngIf=\"username.invalid && username.touched && username.errors?.required\">\n            Username is required!\n          </small>\n          </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-password\" class=\"sr-only\">Password</label>\n          <input name=\"password\" [(ngModel)]=\"user.password\" type=\"password\" id=\"input-password\"\n                 class=\"form-control\" placeholder=\"Password\" #password=\"ngModel\"\n                 [class.form-control-danger]=\"password.invalid && password.touched\"\n                 [required]=\"getConfigValue('forms.validation.password.required')\"\n                 [minlength]=\"getConfigValue('forms.validation.password.minLength')\"\n                 [maxlength]=\"getConfigValue('forms.validation.password.maxLength')\">\n          <small class=\"form-text error\" *ngIf=\"password.invalid && password.touched && password.errors?.required\">\n            Password is required!\n          </small>\n          <small\n            class=\"form-text error\"\n            *ngIf=\"password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)\">\n            Password should contains\n            from {{ getConfigValue('forms.validation.password.minLength') }}\n            to {{ getConfigValue('forms.validation.password.maxLength') }}\n            characters\n          </small>\n        </div>\n\n        <div class=\"form-group accept-group col-sm-12\">\n          <nb-checkbox name=\"rememberMe\" [(ngModel)]=\"user.rememberMe\">Remember me</nb-checkbox>\n          <a class=\"forgot-password\" routerLink=\"../request-password\">Forgot Password?</a>\n        </div>\n\n        <button [disabled]=\"submitted || !form.valid\" class=\"btn btn-block btn-hero-info\"\n                [class.btn-pulse]=\"submitted\">\n          Sign In\n        </button>\n      </form>\n\n",
    //             },] },
    // ];
    // without forgot password
    NbLoginComponent.decorators = [
        { type: Component, args: [{
                    selector: 'nb-login',
                    styles: [".loading{display: inline-block;width: 60px;height: 60px;border: 3px solid #cddcea;border-radius: 50%;border-top-color: #26A9E9;animation: spin 1s ease-in-out infinite;position: fixed;left: calc(50% - 25px);top: calc(50% - 25px);z-index: 1650;}@keyframes spin{to{transform:rotate(360deg)}"],
                    template: "\n    <nb-auth-block>\n    <div *ngIf=\"showSignIn\">\n  <h2 class=\"title\">Sign In</h2>\n      <small class=\"form-text sub-title\">Hello! Sign in with your username and password</small>\n\n      <form (ngSubmit)=\"login()\" #form=\"ngForm\" autocomplete=\"nope\">\n\n        <div *ngIf=\"showMessages.error && errors && errors.length > 0 && !submitted\"\n             class=\"alert alert-danger\" role=\"alert\">\n          <div><strong>Oh snap!</strong></div>\n          <div *ngFor=\"let error of errors\">{{ error }}</div>\n        </div>\n\n        <div *ngIf=\"showMessages.success && messages && messages.length > 0 && !submitted\"\n             class=\"alert alert-info\" role=\"alert\">\n          <div><strong>Hooray!</strong></div>\n          <div *ngFor=\"let message of messages\">{{ message }}</div>\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-username\" class=\"sr-only\">Username</label>\n          <input name=\"username\" [(ngModel)]=\"user.username\" id=\"input-username\" pattern=\".+\"\n                 class=\"form-control\" placeholder=\"Username\" #username=\"ngModel\"\n                 [class.form-control-danger]=\"username.invalid && username.touched\" autofocus\n                 [required]=\"getConfigValue('forms.validation.email.required')\">\n          <small class=\"form-text error\" *ngIf=\"username.invalid && username.touched && username.errors?.required\">\n            Username is required!\n          </small>\n          </div>\n\n        <div class=\"form-group\">\n          <label for=\"input-password\" class=\"sr-only\">Password</label>\n          <input name=\"password\" [(ngModel)]=\"user.password\" type=\"password\" id=\"input-password\"\n                 class=\"form-control\" placeholder=\"Password\" #password=\"ngModel\"\n                 [class.form-control-danger]=\"password.invalid && password.touched\"\n                 [required]=\"getConfigValue('forms.validation.password.required')\"\n                 [minlength]=\"getConfigValue('forms.validation.password.minLength')\"\n                 [maxlength]=\"getConfigValue('forms.validation.password.maxLength')\">\n          <small class=\"form-text error\" *ngIf=\"password.invalid && password.touched && password.errors?.required\">\n            Password is required!\n          </small>\n          <small\n            class=\"form-text error\"\n            *ngIf=\"password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)\">\n            Password should contains\n            from {{ getConfigValue('forms.validation.password.minLength') }}\n            to {{ getConfigValue('forms.validation.password.maxLength') }}\n            characters\n          </small>\n        </div>\n\n        <div class=\"form-group accept-group col-sm-12\">\n        </div>\n\n        <button [disabled]=\"submitted || !form.valid\" class=\"btn btn-block btn-hero-info\"\n                [class.btn-pulse]=\"submitted\">\n          Sign In\n        </button>\n      </form>\n\n </div> \n <div *ngIf=\"!showSignIn\" class=\"loading\">\n  \n</div>",
                },] },
    ];
    /** @nocollapse */
    NbLoginComponent.ctorParameters = function () { return [
        { type: ApiService, },
        { type: ToastrService, },
        { type: CookieService, },
        { type: undefined, decorators: [{ type: Inject, args: [NB_AUTH_OPTIONS,] },] },
        { type: Router, },
        { type: ActivatedRoute, },
    ]; };
    return NbLoginComponent;
}());
export { NbLoginComponent };
//# sourceMappingURL=login.component.js.map