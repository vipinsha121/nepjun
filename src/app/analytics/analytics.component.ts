import { Component, OnInit } from '@angular/core';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { NbThemeService } from '../@nebular/theme';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../common';
import { IRestaurant } from '../models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  themeSubscription: any;
  chartOptions: any = {};
  colors: any;
  echarts: any;

  currentUser: any;

  active_tab_item: number = 0;
  topSellingItems: any;
  totalPrice: any = 0;
  totalItems = 0;
  serviceFee: any;
  subTotal: any;
  totalTax: any;
  subtotal = 0;
  tax = 0;
  allSoldItemsByDate: any;
  restaurants: any;
  selectedRestaurant: IRestaurant;
  selectedRestaurantIndex: number;
  isClient = false;
  isValid = false;
  isDataFromCookies = false;
  maxDate = new Date();
  bsValue = new Date();
  bsRangeValue: Date[];
  enableDatePicker = false;
  alive = false;

  constructor(private apiService: ApiService, private theme: NbThemeService, 
    private cookieService: CookieService, private router: Router, private toastrService: ToastrService) { }

  ngOnInit() {
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      var redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }
    this.fetcRestaurants();
    this.maxDate.setDate(this.maxDate.getDate() - 7);
    this.maxDate.setHours(0,0,0,0);
    this.bsValue.setHours(23,59,59,999);
    this.bsRangeValue = [this.maxDate, this.bsValue];

  }

  ngAfterViewInit() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      this.colors = config.variables;
      this.echarts = config.variables.echarts;
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
    this.alive = false;
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
                this.enableDatePicker = true;
                this.onSelectDate(this.bsRangeValue);

                // get sold items every 20 seconds only for client/manager users
                this.alive = true;
                if (this.currentUser.role === 0 || this.currentUser.role === 1) {
                  IntervalObservable.create(20000)
                    .takeWhile(() => this.alive) // only fires when component is alive
                    .subscribe(() => {
                      this.onSelectDate(this.bsRangeValue);
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
      this.isValid = true;
      this.selectedRestaurant = this.currentUser.restaurant;
      this.enableDatePicker = true;
      this.onSelectDate(this.bsRangeValue);
    }
  }

  onClickTabItem(index: number) {
    this.active_tab_item = index;
    this.onSelectDate(this.bsRangeValue);
  }

  getStatistic(startDate, endDate) {
    this.apiService.soldItemsStatistics(this.selectedRestaurant.id, startDate, endDate).subscribe(
      res => {
        this.topSellingItems = res.response;
        if (this.topSellingItems.length > 6) {
          this.topSellingItems.slice(6, this.topSellingItems.length - 6);
        }
      }
    );
  }

  onSelectRestaurant(index) {
    // console.log('onSelectRestaurant ' + index);
    this.selectedRestaurant = this.restaurants[index];
    this.cookieService.set('selected-restaurant-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurant), null, '/');
    this.cookieService.set('selected-restaurant-index-'+this.currentUser.client_id, Utils.encodeJwt(index), null, '/');
    this.onSelectDate(this.bsRangeValue);
  }

  onSelectDate(value: any): void {
    if (value) {
      const oneDay = 1000 * 60 * 60 * 24;
      value[0] = new Date(value[0].setHours(0,0,0,0));
      value[1] = new Date(value[1].setHours(23,59,59,999));
      let startDate = (value[0].getTime()) / 1000;
      let endDate = (value[1].getTime()) / 1000;

      const duration = Math.round(Math.abs((value[1].getTime() - value[0].getTime())/(oneDay)));
  
      this.getStatistic(startDate, endDate);
  
      this.apiService.soldItems(this.selectedRestaurant.id, startDate, endDate).subscribe(res => {
        this.allSoldItemsByDate = [];
        for (let i = 0 ; i < duration ; i++) {
          let curentDate = new Date(value[1].getTime() - oneDay*i);
          let strDate = (curentDate.getMonth() + 1) + '/' + curentDate.getDate();
          this.allSoldItemsByDate.unshift({ date: strDate, price: 0, tax: 0, serviceFee: 0 });
        }
        
        let totalPrice = 0;
        let subTotal = 0;
        let serviceFee = 0;
        let totalTax = 0;
        this.totalItems = 0;
        
        for (let item of res.response) {
          let date = new Date(item.created_at*1000);
          let strDate = (date.getMonth()+1) + "/" + date.getDate();
  
          let itemSubtotal = item.amounts * item.price;
          let itemTax = item.amounts * item.tax;
          let itemServiceFee = itemSubtotal * this.selectedRestaurant.booking_fee/100;
          this.totalItems += item.amounts;
          
          subTotal += itemSubtotal;
          totalPrice += subTotal + itemTax;
          serviceFee += itemServiceFee;
          totalTax += itemTax;
  
          let index = this.allSoldItemsByDate.findIndex(x => x.date === strDate);
          if (index > -1) {
            this.allSoldItemsByDate[index].price += itemSubtotal;
            this.allSoldItemsByDate[index].tax += itemTax;
            this.allSoldItemsByDate[index].serviceFee += itemServiceFee;
          }
        }
        this.totalPrice = totalPrice.toFixed(2);
        this.subTotal = subTotal.toFixed(2);
        this.totalTax = totalTax.toFixed(2);
        this.serviceFee = serviceFee.toFixed(2);
        this.chartOptions = {
          legend: {
            data: ['Item Subtotal', 'Service Fee', 'Item Tax'],
            align: 'left'
          },
          backgroundColor: this.echarts.bg,
          // color: [this.colors.primaryLight],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              data: [],
              axisTick: {
                alignWithLabel: true,
              },
              axisLine: {
                lineStyle: {
                  color: this.echarts.axisLineColor,
                },
              },
              axisLabel: {
                textStyle: {
                  color: this.echarts.textColor,
                },
              },
            },
          ],
          yAxis: [
            {
              type: 'value',
              axisLine: {
                lineStyle: {
                  color: this.echarts.axisLineColor,
                },
              },
              splitLine: {
                lineStyle: {
                  color: this.echarts.splitLineColor,
                },
              },
              axisLabel: {
                textStyle: {
                  color: this.echarts.textColor,
                },
              },
            },
          ],
          series: [
            {
              name: 'Item Subtotal',
              type: 'bar',
              barWidth: '15%',
              data: [],
              animationDelay: function (idx) {
                return idx * 10;
              },
              color: this.colors.primaryLight,
            },
            {
              name: 'Service Fee',
              type: 'bar',
              barWidth: '15%',
              data: [],
              animationDelay: function (idx) {
                return idx * 10 + 100;
              },
              color: '#f9cfad',
            },
            {
              name: 'Item Tax',
              type: 'bar',
              barWidth: '15%',
              data: [],
              animationDelay: function (idx) {
                return idx * 10 + 100;
              },
              color: '#6c757d',
            },
          ],
        };
        this.subtotal = 0;
        this.tax = 0;
        for (let item of this.allSoldItemsByDate) {
          this.chartOptions.xAxis[0].data.push(item.date);
          this.chartOptions.series[0].data.push(item.price.toFixed(2));
          this.chartOptions.series[1].data.push(item.serviceFee.toFixed(2));
          this.chartOptions.series[2].data.push(item.tax.toFixed(2));
          this.subtotal += item.price;
          this.tax += item.tax;
        }
      });
    }

  }

}

