import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../../common';
import { IRestaurant, Restaurant } from '../../models';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentUser: any;
  bankForm: any;
  prepTimeForm: any;
  restaurant: IRestaurant;

  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private cookieService: CookieService,
    private apiService: ApiService,
    private router: Router) {
  }

  ngOnInit() {
    this.restaurant = new Restaurant();
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      var redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }

    this.bankForm = this.fb.group({
      account: [this.currentUser.restaurant.bank_account ? this.currentUser.restaurant.bank_account.account_number : "", [Validators.required, Validators.minLength(1)]],
      routingNumber: [this.currentUser.restaurant.bank_account ? this.currentUser.restaurant.bank_account.routing_number : "", [Validators.required, Validators.minLength(1)]],
    });
    
    this.prepTimeForm = this.fb.group({
      prepTime: [this.restaurant.prepare_time, [Validators.required, Validators.minLength(1)]],
    });

    this.apiService.getRestaurant(this.currentUser.restaurant_id).subscribe(res => {
      // console.log(res);
      this.restaurant = res.response[0];
    });
  }

  submitBankInfo() {
    if (this.bankForm.controls.account.invalid) return;
    if (this.bankForm.controls.routingNumber.invalid) return;

    this.apiService.addBankAccount(this.currentUser.restaurant.id, this.bankForm.value.account, this.bankForm.value.routingNumber, this.currentUser.username).subscribe(
      res => {
        if (res) {
          if (res.err) {
            this.toastrService.error('Bank was not added!');
          } else {
            this.toastrService.info('Bank was added successfully!');
            this.currentUser.restaurant.bank_account = res.response;
            this.cookieService.set('user', Utils.encodeJwt(this.currentUser), null, '/');
          }
        } else {
          this.toastrService.error('Bank was not added!');
        }
      });
  }

  submitPrepTimeInfo() {
    if (this.prepTimeForm.controls.prepTime.invalid) return;

    let preptime = this.prepTimeForm.value.prepTime;
    this.apiService.updateRestaurantPrepareTime(this.currentUser.restaurant.id, preptime).subscribe(
      res => {
        if (res) {
          if (res.err) {
            this.toastrService.error('Restaurant Prepration time was not updated');
          } else {
            this.toastrService.info('Restaurant Prepration time was updated successfully');
            this.currentUser.restaurant.prepare_time = preptime;
            this.cookieService.set('user', Utils.encodeJwt(this.currentUser), null, '/');
          }
        } else {
          this.toastrService.error('Restaurant Prepration time was not updated');
        }
      });
  }

  toggleRestaurantStatus(event) {
    let status = event?0:1;
    this.apiService.updateRestaurantStatus(this.currentUser.restaurant.id, status).subscribe(
      res => {
        if (res) {
          if (res.err) {
            this.toastrService.error('Restaurant Status was not updated');
          } else {
            this.toastrService.info('Restaurant Status was updated successfully');
            this.currentUser.restaurant.status = status;
            this.cookieService.set('user', Utils.encodeJwt(this.currentUser), null, '/');
          }
        } else {
          this.toastrService.error('Restaurant Status was not updated');
        }
      });
  }

  restaurantStatus() {
    return this.restaurant.status === 0 ? true : false;
  }

  toggleTransactionStatus(event) {
    let status = event ? 'Yes' : 'No';
    this.apiService.updateTransactionStatus(this.currentUser.restaurant.id, status, this.restaurant.map_pin_id).subscribe(
      res => {
        if (res) {
          if (res.err) {
            this.toastrService.error('Menu type was not updated');
          } else {
            this.toastrService.info('Menu type was updated successfully');
            this.currentUser.restaurant.status = status;
            this.cookieService.set('user', Utils.encodeJwt(this.currentUser), null, '/');
          }
        } else {
          this.toastrService.error('Menu type was not updated');
        }
      });
  }

  transactionStatus() {
    return (this.restaurant.tnx_enabled === 'Yes') ? true : false;
  }
  

}
