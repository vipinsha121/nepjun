import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { ViewChild } from '@angular/core';
import { Observable  } from 'rxjs/Observable';
import { of  } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { MatSort, Sort, MatPaginator, PageEvent } from '@angular/material';
import { fromMatSort, sortRows, fromMatPaginator, paginateRows } from '../../services/datasource-utils';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from '../../common';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { DatePipe } from '../../../../node_modules/@angular/common';

@Component({
  selector: 'completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})

export class CompletedComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedRows$: Observable<any>;
  totalRows$: Observable<number>;
  sortEvents$: Observable<Sort>;
  pageEvents$: Observable<PageEvent>;
  runnerId: any;
  socket: any;
  pipe: any;

  constructor(private apiService: ApiService,
    private cookieService: CookieService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router) {
      this.runnerId = route.snapshot.params['runnerId'];
      this.pipe = new DatePipe('en-US');
    }

    ngOnInit() {
      this.getInfo();
      this.createSocket();
    }
  
    ngOnDestroy() {
      this.socket.disconnect();
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
      this.apiService.getCompletedOrdersByRunnerId(this.runnerId).subscribe(
        res => {
            console.log(res);
            if (res) {
                if (!res.err && res.response) {
                  const rows$ = of(res.response);
                  this.sortEvents$ = fromMatSort(this.sort);
                  this.pageEvents$ = fromMatPaginator(this.paginator);
                  this.totalRows$ = rows$.pipe(map(rows => rows.length));
                  this.displayedRows$ = rows$.pipe(sortRows(this.sortEvents$), paginateRows(this.pageEvents$));
                } else {
                    this.toastrService.error('Cannot fetch orders!');
                }
            } else {
                this.toastrService.error('Cannot fetch orders!');
            }
        });
    }

    getDate(order) {
      return order.status == 7 ? this.transformDate(order.completed_at) : this.transformDate(order.rejected_by_user_at)
    }

    transformDate(time) {
      return this.pipe.transform(new Date(time * 1000), 'M/d/yy, h:mm a')
    }
}
