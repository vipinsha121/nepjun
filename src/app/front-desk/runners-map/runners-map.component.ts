import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../../common';
import { MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'runners-map',
  templateUrl: './runners-map.component.html',
  styleUrls: ['./runners-map.component.scss']
})
export class RunnersMapComponent implements OnInit {
  currentUser: any;
  status: number;
  selectedOrder: string;
  restaurant: any;
  showMap = false;
  showOrders = false;
  showClusters = false;
  showDelivered = false;
  showActive = false;
  showRejected = false;
  showNew = false;
  ShowNoData = false;
  markerIndex: number;
  markerColors = ['purple', 'blue', 'green', 'red', 'orange', 'yellow']
  batches: any;
  oldBatches: any;
  orders: any;
  newOrdersId = [];
  pastOrdersId = [];
  constructor(private apiService: ApiService,
    private cookieService: CookieService,
    private router: Router) {
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      var redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }
    this.selectedOrder = 'Clusters';
    this.showClusters = true;
  }

  ngOnInit() {
    this.populateMap();
  }

  populateMap() {
    this.apiService.get(`restaurant/get/${this.currentUser.restaurant_id}`)
      .subscribe(res => {
        if (!res.err && res.response) {
          //console.log("resto",res.response)
          this.restaurant = res.response[0];
          this.showMap = true;
        }
      })
    if (this.showClusters) {
      this.showOrders = false;
      this.apiService.get(`order/batchs/${this.currentUser.restaurant_id}`)
        .subscribe(res => {
          console.log(res.response);
          if (!res.err && res.response) {
            this.orders = res.response;
            if (this.ShowNoData) {
              this.orders = [];
              this.ShowNoData = false;
            }
            const size = 20
            this.orders.forEach(batch => {
              this.markerIndex = this.getRandomInt(this.markerColors.length - 1)
              batch.icon = {
                url: `https://paranoid-cdn.s3-us-west-1.amazonaws.com/uploads/${this.markerColors[this.markerIndex]}-dot.png`,
                scaledSize: {
                  height: size,
                  width: size
                }
              }
              batch.labelOptions = {
                text: `${batch.order_per_batch}`,
                color: 'white', fontSize: '12px', fontWeight: 'bold'
              }

            });
          }
        });
    } else {
      this.showOrders = true;
      this.apiService.get(`orders/map/${this.currentUser.restaurant_id}/${this.status}`)
        .subscribe(res => {
          if (!res.err && res.response) {
            this.orders = res.response;
            const size = 20
            console.log("orders", this.orders, this.markerIndex);
            this.orders.forEach(batch => {
              //this.markerIndex = this.getRandomInt(this.markerColors.length-1)
              batch.icon = {
                url: `https://paranoid-cdn.s3-us-west-1.amazonaws.com/uploads/${this.markerColors[this.markerIndex]}-dot.png`,
                scaledSize: {
                  height: size,
                  width: size
                }
              }
              batch.labelOptions = {
                text: `${batch.order_per_batch}`,
                color: 'white', fontSize: '12px', fontWeight: 'bold'
              }

            });
          }
        });
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  orderOnMap(event: MatCheckboxChange, orderType: string) {
    this.selectedOrder = orderType;
    if (orderType === 'Clusters' && event.checked == true) {
      this.showClusters = true;
      this.showNew = false;
      this.showActive = false;
      this.showDelivered = false;
      this.showRejected = false;
    }
    else if (orderType === 'New' && event.checked == true) {
      this.status = 0;
      this.markerIndex = 0;
      this.showNew = true;
      this.showClusters = false;
      this.showActive = false;
      this.showDelivered = false;
      this.showRejected = false;
    } else if (orderType === 'Active' && event.checked == true) {
      this.markerIndex = 1;
      this.status = 1;
      this.showActive = true;
      this.showClusters = false;
      this.showNew = false;
      this.showDelivered = false;
      this.showRejected = false;
    } else if (orderType === 'Delivered' && event.checked == true) {
      this.markerIndex = 2;
      this.status = 7;
      this.showDelivered = true;
      this.showClusters = false;
      this.showNew = false;
      this.showActive = false;
      this.showRejected = false;
    } else if (orderType === 'Rejected' && event.checked == true) {
      this.markerIndex = 3;
      this.status = 8;
      this.showRejected = true;
      this.showClusters = false;
      this.showNew = false;
      this.showActive = false;
      this.showDelivered = false;
    } else if (orderType === 'Clusters' && event.checked == false) {
      this.ShowNoData = true;
    }
    else {
      this.showClusters = true;
      this.showNew = false;
      this.showActive = false;
      this.showDelivered = false;
      this.showRejected = false;
      this.selectedOrder = 'Clusters';
    }
    this.populateMap();
  }
}
