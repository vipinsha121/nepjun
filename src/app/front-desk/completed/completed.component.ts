import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Utils } from '../../common';
import { formatDate, DatePipe } from '../../../../node_modules/@angular/common';
import 'rxjs/add/operator/takeWhile';
import { CustomerComponent } from '../customer/customer.component';
import { TextAreaComponent } from '../shared/textarea.component';
import { ButtonViewComponent } from '../shared/buttonview.component';

declare var $: any;

@Component({
  selector: 'completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent {

  settings = {
    mode: 'inline',
    noDataMessage: '',
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      save: false,
      cancel: false,
    },
    columns: {
      status: {
        title: 'Status',
        type: 'string',
        filter: false,
        sort: false,
        valuePrepareFunction: (status) => {
          if (status == 2) return 'Cancelled';
          else if (status == 7) return 'Completed';
          else if (status == 8) return 'Rejected';
        },
      },
      id: {
        title: 'Order#',
        type: 'string',
        filter: false,
        sort: false,
        sortDirection: 'desc',
      },
      customer_name: {
        title: 'Customer',
        type: 'custom',
        renderComponent: CustomerComponent,
        filter: false,
        sort: false,
      },
      location_zipcode: {
        title: 'Location',
        type: 'string',
        filter: false,
        sort: false,
      },
      notes: {
        title: 'Notes',
        type: 'custom',
        filter: false,
        sort: false,
        renderComponent: TextAreaComponent,
      },
      date: {
        title: 'Date',
        type: 'string',
        filter: false,
        sort: false,
      },
      view: {
        title: 'Action',
        type: 'custom',
        filter: false,
        sort: false,
        renderComponent: ButtonViewComponent,
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  currentUser: any;
  today: any;
  pipe: any;

  constructor(private apiService: ApiService,
    private cookieService: CookieService,
    private toastrService: ToastrService,
    private router: Router) {
    this.pipe = new DatePipe('en-US');
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      var redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }
    this.getInfo();
  }


  getInfo() {
    this.apiService.get(`orders/completed/restaurant/${this.currentUser.restaurant_id}`).subscribe(
      res => {
        if (!res.err) {
          const orders = res.response
          orders.forEach(order => {
            order.date = this.getDate(order)
          });
          this.source.load(res.response);

        } else {
          this.toastrService.error('Cannot fetch orders!');
        }
      });
  }

  getDate(order) {
    switch (order.status) {
      case 2:
        return this.transformDate(order.cancelled_at)
      case 7:
        return this.transformDate(order.completed_at)
      case 8:
        return this.transformDate(order.rejected_by_user_at)
    }
  }

  transformDate(time) {
    return this.pipe.transform(new Date(time * 1000), 'M/d/yy, h:mm a')
  }
}
