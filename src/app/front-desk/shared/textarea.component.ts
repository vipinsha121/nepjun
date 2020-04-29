import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table/components/cell/cell-view-mode/view-cell';
import { ApiService } from '../../services/api.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Utils } from '../../common';

@Component({
    selector: 'textarea-view',
    template: `
    <p class="flex-start"><i class="nb-edit" (click)="openModal()" style="font-size: 20px; cursor: pointer;padding-right: 2px;"></i>
        <span>{{rowData.notes}}</span></p>
    `,
    styleUrls: ['./shared.component.scss'],
})
export class TextAreaComponent implements ViewCell {
    @Input() value: string | number;
    @Input() rowData: any;

    constructor(private modalService: NgbModal) { }

    openModal() {
        const activeModal = this.modalService.open(NotesModalComponent, { size: 'lg', container: 'nb-layout' });
        activeModal.componentInstance.order = this.rowData;
    }
}

@Component({
    selector: 'textarea-view',
    template: `
    <div class="modal-header" style="padding: 10px 16px;">
        <h5 class="modal-title">Notes</h5>
        <i class="nb-close close-modal" (click)="closeModal()"></i>
    </div>
    <div class="modal-body" *ngIf="pOrder">
        <textarea [(ngModel)]="pOrder.notes" rows="10"></textarea>
    </div>
    <div class="modal-footer flex-space-between" style="padding: 10px 16px;">
    <button mat-raised-button (click)="closeModal()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </div>
    `,
    styleUrls: ['./shared.component.scss'],
})
export class NotesModalComponent implements OnInit {
    @Input() order: any;
    pOrder: any;

    constructor(private apiService: ApiService, 
        private activeModal: NgbActiveModal,
        private toastrService: ToastrService) { }
    
    ngOnInit() {
        this.pOrder = {...this.order}
    }

    onSave() {
        this.closeModal()
        this.apiService.post('order/notes', this.pOrder)
            .subscribe(res => {
                Utils.logs(res)
                if (!res.err) {
                    this.toastrService.info('Note was updated');
                } else {
                    this.toastrService.error('Note was not updated!');
                }
            })

    }

    closeModal() {
        this.activeModal.close()
    }
}

