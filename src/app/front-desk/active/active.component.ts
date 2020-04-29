import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Utils } from '../../common';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { formatDate, DatePipe } from '../../../../node_modules/@angular/common';
import 'rxjs/add/operator/takeWhile';
import { CustomerComponent } from '../customer/customer.component';
import { TextAreaComponent } from '../shared/textarea.component';
import { ButtonViewComponent } from '../shared/buttonview.component';

declare var $: any;

@Component({
  selector: 'active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss']
})
export class ActiveComponent implements OnInit, OnDestroy {

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
          if (status == 1) return 'Accepted';
          else if (status == 3) return 'Preparing';
          else if (status == 4) return 'Assigned';
          else if (status == 5) return 'Out for Delivery';
        },
      },
      order_id: {
        title: 'Order#',
        type: 'string',
        filter: false,
        sort: false,
        sortDirection:  'desc',
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
      accepted_at: {
        title: 'Accepted At',
        type: 'string',
        valuePrepareFunction: (timestamp) => {
          if (timestamp == 0)
            return '';
          const now = this.pipe.transform(Date.now(), 'M/d/yy');
          const createdAt = this.pipe.transform(new Date(timestamp * 1000), 'M/d/yy');
          if (now === createdAt) {
            return 'Today, ' + this.pipe.transform(new Date(timestamp * 1000), 'h:mm a');
          } else {
            return this.pipe.transform(new Date(timestamp * 1000), 'short');
          }
        },
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
    // rowClassFunction: (row) =>{
    //   if(row.data.status === 1 || row.data.status === 2){
    //     return 'pending';
    //   } else if(row.data.status === 3 || row.data.status === 4) {
    //     return 'ready2pickup'
    //   }
    // }
  };

  source: LocalDataSource = new LocalDataSource();
  currentUser: any;
  socket: any;
  today: any;
  pipe: any;
  alive = true;
  activeOrders: any;
  inputValue: string;

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

  ngOnInit() {
    this.createSocket();
    this.today = Date.now();

    // get active orders every 10 seconds only for front desk users
    if (this.currentUser.role === 2) {
      IntervalObservable.create(10000)
        .takeWhile(() => this.alive) // only fires when component is alive
        .subscribe(() => {
          this.getInfo();
          this.today = Date.now();
        });
    }
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

  getInfo() {
    this.apiService.get(`orders/active/restaurant/${this.currentUser.restaurant_id}`).subscribe(
      res => {
          if (!res.err) {
            Utils.logs(res.response)
            this.activeOrders = res.response
            this.source.load(this.activeOrders);
          } else {
              this.toastrService.error('Cannot fetch orders!');
          }
      });
  }

  runAlgorithm() {
    Utils.logs('runAlgorithm')
    this.apiService.get(`order/cluster/${this.currentUser.restaurant_id}`)
    .subscribe(res => {
      Utils.logs(res)
      Utils.logs('assignRunners')
      this.apiService.get(`order/batches/assignRunners/${this.currentUser.restaurant_id}`)
      .subscribe(res => {
        Utils.logs(res)
        if (!res.err) {
          this.toastrService.info('Runners have been assigned');
        } else {
            this.toastrService.error('Runners assignment failed!');
        }
      })
    })
  }

  clearSearch() {
    this.inputValue = ''
    this.onSearch()
  }

  onSearch(query: string = '') {
    Utils.logs(query)
    let operation = false
    if (query === '') {
      operation = true
    }
    this.source.setFilter([
      // fields we want to include in the search
      {
        field: 'order_id',
        search: query
      },
      {
        field: 'customer_name',
        search: query
      },
      {
        field: 'location_zipcode',
        search: query
      },
      {
        field: 'status',
        search: query
      }
    ], operation); 
    // second parameter specifying whether to perform 'AND' or 'OR' search 
    // (meaning all columns should contain search query or at least one)
    // 'AND' by default, so changing to 'OR' by setting false here
  }
}
