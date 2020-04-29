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
  selector: 'pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit, OnDestroy {

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
          if (status == 0) return 'New Order';
        },
      },
      id: {
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
      created_at: {
        title: 'Created At',
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
    rowClassFunction: (row) =>{
      if(row.data.status === 1 || row.data.status === 2){
        return 'pending';
      } else if(row.data.status === 3 || row.data.status === 4) {
        return 'ready2pickup'
      }
    }
  };

  source: LocalDataSource = new LocalDataSource();
  currentUser: any;
  socket: any;
  today: any;
  pipe: any;
  pastOrders = [];
  audio: any;
  hideSoundBtn: string;
  showEnableAudio: boolean;
  alive = true;

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
    this.audio = new Audio();
    this.createSocket();
    this.today = Date.now();
    this.hideSoundBtn = localStorage.getItem('hideSoundBtn');
    this.showEnableAudio = true;

    // get pending orders every 10 seconds only for front desk users
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
    this.apiService.getPendingOrders(this.currentUser.restaurant_id).subscribe(
      res => {
          if (!res.err) {
            Utils.logs(res.response)
            const newOrders = res.response;
            this.source.load(res.response);
            if (this.pastOrders.length > 0) {
              newOrders.forEach(order => {
                // check if order_id exists in past orders
                if (this.pastOrders.filter(o => o.id === order.id).length === 0 ){
                  // Utils.logs('new order');
                  this.audio.load();
                  this.audio.play();
                }

              });
              this.pastOrders = newOrders;
            } else {
              this.pastOrders = newOrders;
            }
          } else {
              this.toastrService.error('Cannot fetch orders!');
          }
      });
  }

  enableAudio() {
    localStorage.setItem('hideSoundBtn', 'true');
    this.audio.src = '../../assets/sounds/WoopWoop.wav';
    this.audio.load();
    this.audio.play();
    this.showEnableAudio = false;
  }
  disableAudio() {
    this.audio.src = '';
    this.showEnableAudio = true;
  }
}
