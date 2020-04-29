import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../../common';
import { NbMenuService } from '../../@nebular/theme/components/menu/menu.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { FileService } from '../../services/file.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss']
})
export class AddItemModalComponent implements OnInit {

  @Input() menu_id;
  @Input() category_id;

  itemDetailForm: any;

  imageUploaded: boolean = false;
  imageUploadFailed: boolean = false;
  uploadPercent: any = 100;
  tempThumbnail: any;
  linkThunbnail: any = '';
  itemStatus = true;
  uploader: FileUploader;
  showSpinner = false;

  constructor(private activeModal: NgbActiveModal,
    private api_service: ApiService,
    private fileService: FileService,
    private menuService: NbMenuService,
    private cookieService: CookieService,
    private router: Router,
    private toastrService: ToastrService,
    private fb: FormBuilder) { 
      
    this.itemDetailForm = this.fb.group({
      itemName: ['', [Validators.required, Validators.minLength(1)]],
      itemDescription: ['', null],
      itemPrice: ['', [Validators.min(0)]],
      itemTax: ['', [Validators.min(0)]],
      thumbnail: ['', [Validators.required, Validators.minLength(1)]],
      isStatic: [0, null],
      isFastLine: [1, null],
      isInSeat: [1, null],
    });
  }

  ngOnInit() {
    this.uploader = new FileUploader({
      url: `https://api.paranoidfan.com/api/sdk/upload`,
      isHTML5: true,
      headers: [{
          name: 'Authkey',
          value: 'NCta}*XTV1R6SCta}*XTV1R0'
      }]
    });
  }

  addItem() {
    if (this.itemDetailForm.controls.itemName.invalid) return;
    if (this.itemDetailForm.controls.itemPrice.invalid) return;
    if (this.itemDetailForm.controls.itemTax.invalid) return;
    this.showSpinner = true;
    const _that = this;
    const status = (this.itemStatus) ? 1 : 0;
    this.itemDetailForm.value.isStatic = (this.itemDetailForm.value.isStatic) ? 1 : 0;
    this.itemDetailForm.value.isFastLine = (this.itemDetailForm.value.isFastLine) ? 1 : 0;
    this.itemDetailForm.value.isInSeat = (this.itemDetailForm.value.isInSeat) ? 1 : 0;

    if (this.uploader.queue.length > 0) {
      this.uploader.queue.forEach(item => {
          if (item.file.type.match(/image/)) {
              item.alias = 'photo';
              this.uploader.onBuildItemForm = (item, form) => {
                  form.append('path', 'uploads/');
              };
              item.upload();
          }
      });
    } else {
      this.callApi(_that)
    }
    
    this.uploader.onCompleteItem = function (item, response, status, headers) {
      // console.log(item)
      console.log(status)
      if (status === 200) {
          const res = JSON.parse(response);
          if (item.alias === 'photo') {
            _that.linkThunbnail = res.URL;
          }
          // console.log(item, res, status);
      } else {
          item.upload();
      }
    };

    this.uploader.onCompleteAll = function () {
      _that.callApi(_that)
    }
  }

  callApi(_that) {
    if (_that.linkThunbnail == undefined || _that.linkThunbnail == null){
      _that.linkThunbnail = '';
    }
    
    _that.api_service.addItem(_that.category_id, _that.itemDetailForm.value.itemName,
      _that.itemDetailForm.value.itemDescription, _that.itemDetailForm.value.itemPrice, 
      _that.itemDetailForm.value.itemTax, _that.linkThunbnail, status, _that.itemDetailForm.value.isStatic, 
      _that.itemDetailForm.value.isFastLine, _that.itemDetailForm.value.isInSeat).subscribe(
      res => {
          if (res) {
              if (!res.err) {
                _that.toastrService.info('Successfully added!');
                _that.activeModal.close();
                _that.activeModal.dismiss();
              } else {
                _that.showSpinner = false;
                _that.toastrService.error(res.msg);
              }
          } else {
            _that.showSpinner = false;
            _that.toastrService.error('An error has occurred, please try again later');
          }
      });
  }

  toggleItemStatus(status) {
    this.itemStatus = status;
  }

  readURL(event) {
    document.getElementById('add-item-icon').setAttribute('src', URL.createObjectURL(event.target.files[0]));
  }

  closeModal() {
    this.activeModal.dismiss();
  }

}
