import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Utils } from '../../common';

@Component({
  selector: 'order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {

  @Input() order: any;

  constructor(private activeModal: NgbActiveModal,
    private apiService: ApiService,
    private toastrService: ToastrService) {

  }

  ngOnInit() {
    // Utils.logs(this.order)
  }

  updateOrderStatus(status) {
    this.apiService.updateOrderStatus(this.order.order_id, status).subscribe(
      res => {
          // Utils.logs(res);
          if (res) {
              if (!res.err) {
                this.toastrService.info('Updated successfully');
                this.order.status = status;
                this.updatePendingOrdersCount();
              } else {
                  this.toastrService.error('Update Failed!');
              }
          } else {
              this.toastrService.error('Update Failed!');
          }
      });
  }

  updatePendingOrdersCount() {
    this.apiService.updatePendingOrders(this.order.runner_id).subscribe(res => {
      if (res.err) {
       // console.error(res.err);
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }
}
