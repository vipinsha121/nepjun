import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewCell } from 'ng2-smart-table/components/cell/cell-view-mode/view-cell';

@Component({
  selector: 'customer-modal',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() order: any;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close()
  }

}

@Component({
  selector: 'customer',
  template: `<p class="customer-name" (click)="openModal()">{{rowData.customer_name}}</p>`,
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements ViewCell, OnInit {
  @Input() value: string | number;
  @Input() rowData: any;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  openModal() {
    const activeModal = this.modalService.open(ModalComponent, { size: 'lg', container: 'nb-layout' });
    activeModal.componentInstance.order = this.rowData;
  }

}
