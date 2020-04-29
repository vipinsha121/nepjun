import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table/components/cell/cell-view-mode/view-cell';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from '../../common';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { DatePipe } from '../../../../node_modules/@angular/common';
import 'rxjs/add/operator/takeWhile';

declare var $: any;
declare var google: any;

@Component({
  selector: 'button-view',
  styleUrls: ['./pending.component.scss'],
  template: `<div class="flex-center"><button class="btn-custom" (click)="onClick()"><i class="nb-menu"></i></button></div>`,
})
export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;

  @Output() onUpdateStatus: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: NgbModal, private apiService: ApiService) {
  }

  ngOnInit() {
  }

  onClick() {
    const activeModal = this.modalService.open(OrderDetailComponent, { size: 'lg', container: 'nb-layout' });
    activeModal.componentInstance.order = this.rowData;
  }
}

@Component({
  selector: 'pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit, OnDestroy {
  @Output() onUpdateStatus: EventEmitter<any> = new EventEmitter();
  showMap = false;
  order: any;
  pOrders: any;
  lat: any = 40.76148;
  long: any = -73.9856;
  settings = {
    mode: 'inline',
    hideSubHeader: true,
    actions: {
      add: false,
      edit: false,
      delete: false,
      save: false,
      cancel: false,
    },
    columns: {
      order_id: {
        title: 'Order',
        type: 'string',
        filter: true,
        sort: true,

      },
      customer_name: {
        title: 'Customer',
        type: 'string',
        filter: false,
        sort: true,
      },
      customer_location: {
        title: 'Location',
        type: 'string',
        filter: false,
        sort: true,
      },
    },
    rowClassFunction: (row) => {
      if (row.data.status === 1 || row.data.status === 2) {
        return 'pending';
      } else if (row.data.status === 3 || row.data.status === 4) {
        return 'ready2pickup'
      }
    }
  };
  source: LocalDataSource = new LocalDataSource();
  runnerId: any;
  socket: any;
  today: any;
  pipe: any;
  pastOrders = [];
  audio: any;
  hideSoundBtn: string;
  showEnableAudio: boolean;
  alive = true;
  pOrdersOrder_Id = [];
  newOrdersOrder_Id = [];

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router) {
    this.pipe = new DatePipe('en-US');
    this.runnerId = route.snapshot.params['runnerId'];
    localStorage.setItem('runnerId', this.runnerId)
  }

  ngOnInit() {
    this.audio = new Audio();
    this.createSocket();
    this.today = Date.now();
    this.hideSoundBtn = localStorage.getItem('hideSoundBtn');
    this.showEnableAudio = true;

    this.getInfo();
    // get pending orders every 10 seconds only for runners
    IntervalObservable.create(10000)
      .takeWhile(() => this.alive) // only fires when component is alive
      .subscribe(() => {
        this.getInfo();
        this.today = Date.now();
      });
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
    this.apiService.get(`order/pending/runner/${this.runnerId}`).subscribe(
      res => {
        console.log("orders", res.response)
        Utils.logs(res);
        if (res) {
          if (!res.err) {
            const newOrders = res.response;
            this.source.load(newOrders);
            const newIds = [...newOrders.map(order => order.id)]
            const pastIds = (this.pastOrders && [...this.pastOrders.map(order => order.id)]) || []
            if (JSON.stringify(newIds) !== JSON.stringify(pastIds)
              || !this.pastOrders) {
              this.updateMap(newOrders)F
            }
            this.pastOrders = newOrders;
          } else {
            this.toastrService.error('Cannot fetch orders!');
          }
        } else {
          this.toastrService.error('Cannot fetch orders!');
        }
      });
  }

  updateOrderStatus(order_id, status) {
    this.apiService.updateOrderStatus(order_id, status).subscribe(
      res => {
        // Utils.logs(res);
        if (res) {
          if (!res.err) {
            this.toastrService.info('Updated successfully');
          } else {
            this.toastrService.error('Update Failed!');
          }
        } else {
          this.toastrService.error('Update Failed!');
        }
      });
  }

  updateMap(newOrders) {
    this.pOrders = [...newOrders]
    const size = 20
    if (this.pOrders && this.pOrders.length > 0) {
      this.pOrders.forEach((order, i) => {
        if (i == 0) {
          this.lat = order.latitude;
          this.long = order.longitude;
        }
        order.icon = {
          url: `https://paranoid-cdn.s3-us-west-1.amazonaws.com/uploads/purple-dot.png`,
          scaledSize: {
            height: size,
            width: size
          },
          // origin: new google.maps.Point(0, 0),
          // anchor: new google.maps.Point(size / 2, size / 2)
        }
        order.labelOptions = {
          text: `${order.order_id}`,
          color: 'white', fontSize: '12px', fontWeight: 'bold'
        }
      })
    }
    this.showMap = true;
  }

  orderDetailsModal(order, isModal) {
    const activeModal = this.modalService.open(OrderDetailComponent, { size: 'lg', container: 'nb-layout' });
    if (isModal === "MapModal") {
      activeModal.componentInstance.order = order;
    } else {
      activeModal.componentInstance.order = order.data;
    }
  }
}
