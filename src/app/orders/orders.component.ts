import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { ToastrService } from 'ngx-toastr';

import { ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable  } from 'rxjs/Observable';
import { of  } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { MatSort, Sort, MatPaginator, PageEvent } from '@angular/material';
import { fromMatSort, sortRows, fromMatPaginator, paginateRows } from '../services/datasource-utils';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../common';
import * as io from 'socket.io-client';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';
import { IRestaurant } from '../models';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/takeWhile';


@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})

export class OrdersComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedRows$: Observable<any>;
  totalRows$: Observable<number>;
  
  currentUser: any;

  sortEvents$: Observable<Sort>;
  pageEvents$: Observable<PageEvent>;

  socket: any;
  isClient = false;
  isValid = false;
  alive = false;
  isDataFromCookies = false;
  restaurants: any;
  selectedRestaurant: IRestaurant;
  selectedRestaurantIndex: number;
  today: any;
  pipe: any;
  pastOrders = [];
  audio: any;
  hideSoundBtn: string;
  showEnableAudio: boolean;
  data: any;
  time = 0;

  constructor(private apiService: ApiService,
    private cookieService: CookieService,
    private toastrService: ToastrService,
    private router: Router) { 
    }
      
    ngOnInit() {
      this.audio = new Audio();
      this.today = Date.now();
      this.hideSoundBtn = localStorage.getItem('hideSoundBtn');
      this.showEnableAudio = true;
      if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
        const redirect = '/auth/login';
        this.router.navigateByUrl(redirect);
        return;
      } else {
        this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
      }
      this.fetcRestaurants();
      this.createSocket();
    }
  
    ngOnDestroy() {
      this.socket.disconnect();
      this.alive = false;
    }
  
    createSocket() {
      this.socket = io(environment.SERVER_URL);
      this.socket.on('message', (data) => {
        Utils.logs('Order was updated, Refreshing data now...', data);
        this.getInfo();
      });
      this.socket.on('onconnected', (data) => {
        Utils.logs('Socket.io was connected, user_id = ' + data.id);
      });
      this.socket.on('disconnect', () => {
        Utils.logs('Socket connection was disconnected');
      });
    }


    onSelectRestaurant(index) {
      Utils.logs('onSelectRestaurant ' + index);
      this.selectedRestaurant = this.restaurants[index];
      this.cookieService.set('selected-restaurant-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurant), null, '/');
      this.cookieService.set('selected-restaurant-index-'+this.currentUser.client_id, Utils.encodeJwt(index), null, '/');
      this.getInfo();
    }
  
    fetcRestaurants() {
      if (this.currentUser.role === 0) {
        // is a client
        this.isClient = true;

        if (this.cookieService.check('restaurants-'+this.currentUser.client_id) && this.cookieService.get('restaurants-'+this.currentUser.client_id) != ''
          && this.cookieService.check('selected-restaurant-index-'+this.currentUser.client_id) && this.cookieService.get('selected-restaurant-index-'+this.currentUser.client_id) != ''
          && this.cookieService.check('selected-restaurant-'+this.currentUser.client_id) && this.cookieService.get('selected-restaurant-'+this.currentUser.client_id) != '') {
          this.restaurants = Utils.decodeJwt(this.cookieService.get('restaurants-'+this.currentUser.client_id));
          this.selectedRestaurant = Utils.decodeJwt(this.cookieService.get('selected-restaurant-'+this.currentUser.client_id));
          this.selectedRestaurantIndex = Utils.decodeJwt(this.cookieService.get('selected-restaurant-index-'+this.currentUser.client_id));
          this.isDataFromCookies = true;
          this.isValid = true;
        } 

        this.apiService.getRestaurantsByClientId(this.currentUser.client_id).subscribe(
          res => {
          // console.log(res);
          if (res) {
              if (!res.err) {
                if (res.response && res.response.length > 0) {
                  this.restaurants = res.response;
                  this.cookieService.set('restaurants-'+this.currentUser.client_id, Utils.encodeJwt(this.restaurants), null, '/');
                  if (this.isDataFromCookies) {
                    // update restaurant data
                    this.selectedRestaurant = this.restaurants[this.selectedRestaurantIndex];
                  } else {
                    this.selectedRestaurant = this.restaurants[0];
                    this.selectedRestaurantIndex = 0;
                    this.cookieService.set('selected-restaurant-index-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurantIndex), null, '/');
                  }
                  this.cookieService.set('selected-restaurant-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurant), null, '/');
                  // console.log(this.restaurants);
                  this.getInfo();

                  // get sold orders every 20 seconds only for client/manager users
                  this.alive = true;
                  if (this.currentUser.role === 0 || this.currentUser.role === 1) {
                    IntervalObservable.create(20000)
                      .takeWhile(() => this.alive) // only fires when component is alive
                      .subscribe(() => {
                        this.getInfo();
                      });
                  }
                  this.isValid = true;
                } else {
                  this.toastrService.error('You must create at least one concession.');
                }
              } else {
                  this.toastrService.error('Cannot fetch restaurants!');
              }
          } else {
              this.toastrService.error('Cannot fetch restaurants!');
          }
        });
      } else {
        this.selectedRestaurant = this.currentUser.restaurant;
        this.getInfo();

        // get sold orders every 20 seconds only for client/manager users
        this.alive = true;
        if (this.currentUser.role === 0 || this.currentUser.role === 1) {
          IntervalObservable.create(20000)
            .takeWhile(() => this.alive) // only fires when component is alive
            .subscribe(() => {
              this.getInfo();
            });
        }
        this.isValid = true;
      }
    }
    getInfo() {

      this.apiService.getPendingOrders(this.selectedRestaurant.id).subscribe(
        res => {
            // console.log(res);
            if (res) {
                if (!res.err) {
                  this.today = Date.now();
                  this.data = [];
                  const newOrders = res.response;
                  for (let order of res.response) {
                    let price = 0;
                    for (let item of order.items) {
                      price += (item.price * (1 + item.tax));
                    }
                    this.getOrderStatus(order);
                    this.data.push({
                      id: order.id,
                      customer_id: order.customer_id,
                      customer_name: order.customer_name,
                      customer_token: order.customer_token,
                      customer_location: order.customer_location,
                      currency_symbol: order.currency_symbol,
                      transaction_id: order.transaction_id,
                      status: order.status,
                      paid: order.order_total.toFixed(2),
                      created_at: order.created_at,
                      ready_at: order.ready_at,
                      items: order.items,
                      time: Utils.getDate(this.time),
                    });
                  }
                  // this.source.load(data);
                  if (this.pastOrders.length > 0) {
                    newOrders.forEach(order => {
                      // check if order_id exists in past orders
                      if (this.pastOrders.filter(o => o.id === order.id).length === 0 ){
                        Utils.logs('new order');
                        this.audio.load();
                        this.audio.play();
                      }
  
                    });
                    this.pastOrders = newOrders;
                  } else {
                    this.pastOrders = newOrders;
                  }

                  // get completed orders
                  this.apiService.getCompletedOrders(this.selectedRestaurant.id).subscribe(
                    res => {
                        // console.log(res);
                        if (res) {
                            if (!res.err) {
                              for (let order of res.response) {
                                let price = 0;
                                for (let item of order.items) {
                                  price += (item.price * (1 + item.tax));
                                }

                                this.getOrderStatus(order);
                                this.data.push({
                                  id: order.id,
                                  status: order.status,
                                  customer_id: order.customer_id,
                                  customer_name: order.customer_name,
                                  customer_token: order.customer_token,
                                  transaction_id: order.transaction_id,
                                  paid: order.order_total.toFixed(2),
                                  currency_symbol: order.currency_symbol,
                                  created_at: order.created_at,
                                  ready_at: order.ready_at,
                                  items: order.items,
                                  time: Utils.getDate(this.time),
                                });
                              }
                              // console.log(this.data)
                              const rows$ = of(this.data);
                              this.sortEvents$ = fromMatSort(this.sort);
                              this.pageEvents$ = fromMatPaginator(this.paginator);
                              this.totalRows$ = rows$.pipe(map(rows => rows.length));
                              this.displayedRows$ = rows$.pipe(sortRows(this.sortEvents$), paginateRows(this.pageEvents$));
                            } else {
                                this.toastrService.error('Cannot fetch completed orders!');
                            }
                        } else {
                            this.toastrService.error('Cannot fetch completed orders!');
                        }
                    });

                } else {
                    this.toastrService.error('Cannot fetch pending orders!');
                }
            } else {
                this.toastrService.error('Cannot fetch pending orders!');
            }
        });

    }

    getOrderStatus(order) {
      let orderStatus = '';
      switch(order.status) {
        case 0:
          orderStatus = 'Processing Order';
          this.time = order.created_at;
          break;
        case 1:
          orderStatus = 'New Pending Order (Delivery)';
          this.time = order.created_at;
          break;
        case 2:
          orderStatus = 'New Pending Order (Pickup)';
          this.time = order.created_at;
          break;
        case 3:
          orderStatus = 'Ready To Pickup';
          this.time = order.ready_at;
          break;
        case 4:
          orderStatus = 'Ready To Delivery';
          this.time = order.ready_at;
          break;
        case 5:
          orderStatus = 'Completed';
          this.time = order.completed_at;
          break;
        case 6:
          orderStatus = 'Refunded';
          this.time = order.refunded_at;
          break;
        case 7:
          orderStatus = 'Cancelled';
          this.time = order.cancelled_at;
          break;
      }
      return orderStatus;
    }

    enableAudio() {
      localStorage.setItem('hideSoundBtn', 'true');
      this.audio.src = "../../assets/sounds/WoopWoop.wav";
      this.audio.load();
      this.audio.play();
      this.showEnableAudio = false;
    }
    disableAudio() {
      this.audio.src = "";
      this.showEnableAudio = true;
    }
}
