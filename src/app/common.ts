import * as crypto from 'crypto-js';
import {CookieService} from 'ngx-cookie-service';
import { environment } from '../environments/environment';

export class Utils {

  static CookieService: CookieService;

  public static encodeJwt(data) {
    try {
      const encodedHeader = this.base64url(crypto.enc.Utf8.parse(JSON.stringify({"alg": "HS256", "typ": "JWT"})));
      const encodedData = this.base64url(crypto.enc.Utf8.parse(JSON.stringify(data)));
      return encodedHeader + '.' + encodedData;
    } catch (e) {
      console.error('exception in common.ts.decodeJwt', e);
      return null;
    }
  }

  public static decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('exception in common.ts.decodeJwt', e);
      this.CookieService.delete('user');
      window.location.href = '/user/login';
      return null;
    }
  };

  public static base64url(source) {
    try {
      let encodedSource = crypto.enc.Base64.stringify(source);
      encodedSource = encodedSource.replace(/=+$/, '');
      encodedSource = encodedSource.replace(/\+/g, '-');
      encodedSource = encodedSource.replace(/\//g, '_');
      return encodedSource;
    } catch (e) {
      console.error('exception in common.ts.base64url', e);
      return null;
    }
  }

  public static getDate(time) {
    let date = new Date(time * 1000);
    let mm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    let dd = date.getDate();
    let _hh = date.getHours();
    let AM = _hh > 12 ? 'PM' : 'AM';
    let h = _hh < 10 ? '0'+_hh : _hh;
    let m = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes();
    return mm+` `+dd+` `+h+`:`+m+` `+AM;
  }

  public static logs(text, arr=[]) {
    if (!environment.production) {
      console.log(text, ...arr);
    }
  }

  public static capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}


