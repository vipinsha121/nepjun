import { Component, OnInit } from '@angular/core';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { NbThemeService } from '../../@nebular/theme';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../../common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  themeSubscription: any;
  chartOptions: any = {};
  colors: any;
  echarts: any;

  currentUser: any;

  active_tab_item: number = 0;
  topSellingItems: any;
  totalPrice: any = 0;
  serviceFee: any;
  subtotal =0;
  tax = 0;
  allSoldItemsByDate: any;

  constructor(private apiService: ApiService, private theme: NbThemeService,
    private cookieService: CookieService, private router: Router) { }

  ngOnInit() {
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      var redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }
  }

  ngAfterViewInit() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      this.colors = config.variables;
      this.echarts = config.variables.echarts;

      this.getStatistic();
      this.getSoldItems();
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  onClickTabItem(index: number) {
    this.active_tab_item = index;
    this.getStatistic();
    this.getSoldItems();
  }

  getStatistic() {
    this.apiService.getStatistics(this.currentUser.restaurant.id, this.active_tab_item == 0 ? 7 : 30).subscribe(
      res => {
        this.topSellingItems = res.response;
        if (this.topSellingItems.length > 6) {
          this.topSellingItems.slice(6, this.topSellingItems.length - 6);
        }
      }
    );
  }

  getSoldItems() {
    let duration = this.active_tab_item == 0 ? 7 : 30;
    this.apiService.getSoldItems(this.currentUser.restaurant.id, duration).subscribe(
      res => {
        this.allSoldItemsByDate = [];
        for (let i = 0 ; i < duration ; i++) {
          let date = new Date(Date.now() - i * 24 * 3600 * 1000);
          let strDate = (date.getMonth()+1) + "/" + date.getDate();
          this.allSoldItemsByDate.unshift({ date: strDate, price: 0, tax: 0, serviceFee: 0 });
        }
        
        let totalPrice = 0;
        let serviceFee = 0;
        
        for (let item of res.response) {
          let date = new Date(item.created_at*1000);
          let strDate = (date.getMonth()+1) + "/" + date.getDate();

          let itemSubtotal = item.amounts * item.price;
          let itemTax = item.amounts * item.tax;
          let itemServiceFee = itemSubtotal * this.currentUser.restaurant.booking_fee/100;

          totalPrice += this.subtotal + this.tax;
          serviceFee += itemServiceFee;

          let index = this.allSoldItemsByDate.findIndex(x => x.date === strDate);
          if (index > -1) {
            this.allSoldItemsByDate[index].price += itemSubtotal;
            this.allSoldItemsByDate[index].tax += itemTax;
            this.allSoldItemsByDate[index].serviceFee += itemServiceFee;
          }
        }
        this.totalPrice = totalPrice.toFixed(2);
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
      }
    );
  }
}
