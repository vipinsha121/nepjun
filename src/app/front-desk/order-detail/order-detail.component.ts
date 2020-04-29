import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LocalDataSource } from 'ng2-smart-table/lib/data-source/local/local.data-source';

@Component({
  selector: 'order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {

  @Input() order: any;

  settings: any;
  source: LocalDataSource = new LocalDataSource();
  runners: any;
  selectedRunnerId: any;

  constructor(private activeModal: NgbActiveModal,
    private apiService: ApiService,
    private toastrService: ToastrService) {
    }

  ngOnInit() {
    this.settings = {
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
        name: {
          title: 'Item',
          type: 'string',
          filter: false,
          sort: false,
        },
        amounts: {
          title: 'Qty',
          type: 'string',
          filter: false,
          sort: false,
        },
        price: {
          title: 'Price',
          type: 'string',
          filter: false,
          sort: false,
          valuePrepareFunction: price => {
            return this.order.currency_symbol + price.toFixed(2)
          },
        }
      },
    }
    
    this.source.load(this.order.items);

    this.getRunners();
  }

  onCancelOrder() {
    this.closeModal();
    this.updateOrderStatus(2);
  }

  onAcceptOrder() {
    this.closeModal();
    this.updateOrderStatus(1);
  }

  onAssignRunner() {
    this.closeModal();
    console.log('onAssignRunner')
    console.log({batch_id: this.order.batch_id, runner_id: this.selectedRunnerId})
    this.apiService.post(`order/batch/assignRunner`, {batch_id: this.order.batch_id, runner_id: this.selectedRunnerId})
    .subscribe(res => {
      if (!res.err) {
        this.toastrService.info('Runner has been assigned');
      } else {
          this.toastrService.error('Runner assignment failed!');
      }
    })
  }

  updateOrderStatus(status) {
    this.apiService.updateOrderStatus(this.order.id, status).subscribe(
      res => {
          if (res) {
              if (!res.err) {
                this.toastrService.info('Updated successfully');
                this.order.status = status;
              } else {
                  this.toastrService.error('Update Failed!');
              }
          } else {
              this.toastrService.error('Update Failed!');
          }
      });
  }

  closeModal() {
    this.activeModal.close();
  }

  getRunners() {
    this.apiService.get(`runners/${this.order.restaurant_id}`)
    .subscribe(res => {
      console.log(res)
      if(!res.err && res.response) {
        this.runners = res.response
      }
    })
  }
}
