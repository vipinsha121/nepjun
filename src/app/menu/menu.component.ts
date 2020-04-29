import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { AddMenuModalComponent } from './add-menu-modal/add-menu-modal.component';
import { AddItemModalComponent } from './add-item-modal/add-item-modal.component';
import { AddCagetoryModalComponent } from './add-cagetory-modal/add-cagetory-modal.component';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../common';
import { NbMenuService, NbMenuItem } from '../@nebular/theme/components/menu/menu.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { FileService } from '../services/file.service';
import { FileUploader } from 'ng2-file-upload';
import { IRestaurant, Restaurant } from '../models';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @ViewChild('smModal') smModal: ModalDirective;
  isPending: boolean = true;
  mnu_category: any;
  mnu_item: any;
  has_items: boolean = true;
  self: any;
  currentUser: any;

  myMenu: any = '';

  category_id: any = -1;
  item_id: any = -1;

  itemDetailForm: any;
  menuSubscription: any;
  itemStatus: any;
  selectedItem: any;

  imageUploaded: boolean = true;
  imageUploadFailed: boolean = false;
  uploadPercent: any = 100;
  tempThumbnail: any;
  linkThunbnail: any;

  uploader: any;
  restaurants: any;
  selectedRestaurant: IRestaurant;
  selectedRestaurantIndex: number;
  isClient = false;
  vendorID: number;
  selectedCategoryIndex = 0;
  isValid = false;
  isDataFromCookies = false;
  showSpinner=false;

  constructor(private modalService: NgbModal,
    private api_service: ApiService,
    private menuService: NbMenuService,
    private cookieService: CookieService,
    private router: Router,
    private toastrService: ToastrService,
    private fileService: FileService,
    private fb: FormBuilder) { 
    }

    ngOnInit() {
      this.self = this;
      this.selectedRestaurant = new Restaurant();
      this.mnu_category = [];
      this.mnu_item =[];

      if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
        var redirect = '/auth/login';
        this.router.navigateByUrl(redirect);
        return;
      } else {
        this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
      }
      
      this.fetcRestaurant();

      this.itemDetailForm = this.fb.group({
        itemName: ['', [Validators.required, Validators.minLength(1)]],
        itemDescription: ['', null],
        itemPrice: ['', [Validators.min(0)]],
        itemTax: ['', [Validators.min(0)]],
        thumbnail: ['', [Validators.required, Validators.minLength(1)]],
        isStatic: [0, null],
        isFastLine: [1, null],
        isInSeat: [0, null],
      });

      this.uploader = new FileUploader({
        url: `https://api.paranoidfan.com/api/sdk/upload`,
        headers: [{
            name: 'Authkey',
            value: 'BGta}*X2V1M6SCta}*XTV1E8'
        }]
      });

    }
  
    onItemSelection(event) {
      let item = event;
      this.selectedItem = item;
      this.uploader.clearQueue()

      if (item.is_menu) {
        Utils.logs('menu clicked');
        return;
      }
      if (item.is_category) {
        Utils.logs('category clicked');
        this.category_id = item.category_id;
        this.item_id = -1;
        this.fetchItems();
        return;
      }
      if (item.is_item) {
        Utils.logs('item clicked');
        this.item_id = item.item_id;
        this.linkThunbnail = item.thumbnail;
        this.itemDetailForm.setValue({itemName: item.title, itemDescription: item.description, itemPrice: item.price, itemTax: item.tax, thumbnail: '', isStatic: item.is_static, isFastLine: item.is_fast_line, isInSeat: item.is_in_seat});
        this.imageUploaded = true;
        this.imageUploadFailed = false;
        this.itemStatus = item.is_available;
      }
    }

    toggleItemStatus(status) {
      Utils.logs('toggleItemStatus ' + status);
      this.itemStatus = status;
    }

    fetcRestaurant() {
      if (this.currentUser.role === 0) {
        // is a client
        this.isClient = true;
        if (this.cookieService.check('restaurants-'+this.currentUser.client_id) && this.cookieService.get('restaurants-'+this.currentUser.client_id) != ''
          && this.cookieService.check('selected-restaurant-index-'+this.currentUser.client_id) && this.cookieService.get('selected-restaurant-index-'+this.currentUser.client_id) != ''
          && this.cookieService.check('selected-restaurant-'+this.currentUser.client_id) && this.cookieService.get('selected-restaurant-'+this.currentUser.client_id) != '') {
          this.restaurants = Utils.decodeJwt(this.cookieService.get('restaurants-'+this.currentUser.client_id));
          this.selectedRestaurant = Utils.decodeJwt(this.cookieService.get('selected-restaurant-'+this.currentUser.client_id));
          this.selectedRestaurantIndex = Utils.decodeJwt(this.cookieService.get('selected-restaurant-index-'+this.currentUser.client_id));
          this.isDataFromCookies = true;
          this.isValid = true;
        } 

        this.api_service.getRestaurantsByClientId(this.currentUser.client_id).subscribe(
          res => {
          if (res) {
              if (!res.err) {
                if (res.response && res.response.length > 0) {
                  this.restaurants = res.response;
                  this.cookieService.set('restaurants-'+this.currentUser.client_id, Utils.encodeJwt(this.restaurants), null, '/');
                  if (this.isDataFromCookies) {
                    // update restaurant data
                    this.selectedRestaurant = this.restaurants[this.selectedRestaurantIndex];
                  } else {
                    this.selectedRestaurant = this.restaurants[0];
                    this.selectedRestaurantIndex = 0;
                    this.cookieService.set('selected-restaurant-index-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurantIndex), null, '/');
                  }
                  this.cookieService.set('selected-restaurant-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurant), null, '/');
                  this.fetchMenu();
                  this.isValid = true;
                } else {
                  this.toastrService.error('You must create at least one concession.');
                }
              } else {
                  this.toastrService.error('Cannot fetch restaurants!');
              }
          } else {
              this.toastrService.error('Cannot fetch restaurants!');
          }
        });
      } else {
        this.isValid = true;
        this.selectedRestaurant = this.currentUser.restaurant;
        this.fetchMenu();
      }
    }

    fetchMenu() {
      if (this.myMenu !== null)
        this.myMenu = null;
      this.category_id = -1;
      this.item_id = -1;

      let restaurat_id = this.selectedRestaurant.id;
      this.api_service.getMenu(restaurat_id).subscribe(
        res => {
            if (res) {
                if (!res.err) {
                  if (res.response !== null) {
                    let menu = res.response;
                    this.myMenu = menu;
                    this.fetchCategory(this.myMenu.id);
                  }
                } else {
                  this.toastrService.error(res.msg);
                }
            } else {
                this.toastrService.error('Cannot fetch menu!');
            }
        });
    }

    fetchCategory(event: any) {
      let menu_id = event;
      this.category_id = -1;
      this.item_id = -1;

      this.api_service.getCategory(menu_id).subscribe(
        res => {
            if (res) {
                if (!res.err) {
                  if (res.response !== null) {
                    this.mnu_category = [];
                    for (let iterCategory in res.response) {
                      this.mnu_category.push({
                        title: res.response[iterCategory].name, 
                        icon: 'nb-grid-a-outline', 
                        is_category: true, 
                        menu_id: menu_id, 
                        thumbnail: '',
                        source: res.response[iterCategory].source,
                        category_id: res.response[iterCategory].id,
                        is_selected: false,
                        vendor_id: res.response[iterCategory].vendor_id,
                      });
                    }
                  }
                } else {
                  this.toastrService.error(res.msg);
                }
            } else {
                this.toastrService.error('Cannot fetch menu!');
            }
        });
    }

    fetchItems() {
      this.item_id = -1;
      this.api_service.getItems(this.category_id).subscribe(
        res => {
            if (res) {
                if (!res.err) {
                  if (res.response !== null) {
                    this.mnu_item = [];
                    for (var item of res.response) {
                      this.mnu_item.push({
                        title: item.name, 
                        icon: 'nb-arrow-thin-right', 
                        is_item: true, 
                        item_id: item.id, 
                        menu_id: this.myMenu.id, 
                        category_id: this.category_id,
                        thumbnail: item.photo,
                        description: item.description, 
                        price: item.price.toFixed(2), 
                        tax: item.tax.toFixed(2),
                        is_available: item.is_available,
                        is_selected: false,
                        is_static: item.static,
                        is_fast_line: item.fast_line,
                        is_in_seat: item.in_seat
                      });
                    }
                  }
                } else {
                  this.toastrService.error(res.msg);
                }
            } else {
                this.toastrService.error('Cannot fetch items!');
            }
        });
    }

    onSelectRestaurant(index) {
      Utils.logs(this.currentUser)
      Utils.logs('onSelectRestaurant ' + index);
      this.selectedRestaurant = this.restaurants[index];
      this.cookieService.set('selected-restaurant-'+this.currentUser.client_id, Utils.encodeJwt(this.selectedRestaurant), null, '/');
      this.cookieService.set('selected-restaurant-index-'+this.currentUser.client_id, Utils.encodeJwt(index), null, '/');
      this.fetchMenu();
    }

    onSelectCategory(index) {
      Utils.logs('onSelectCategory ' + index);
    }

    addCategory() {
      var self = this;
      const activeModal = this.modalService.open(AddCagetoryModalComponent, { size: 'lg', container: 'nb-layout' });
      activeModal.close = function() {
        self.fetchCategory(self.myMenu.id);
      };
      activeModal.componentInstance.menu_id = this.myMenu.id;
    }

    addMenu() {
      var self = this;
      const activeModal = this.modalService.open(AddMenuModalComponent, { size: 'lg', container: 'nb-layout' });
      activeModal.componentInstance.currentUser = this.currentUser;
      activeModal.close = function() {
        self.fetchMenu();
      };
      activeModal.componentInstance.menu_id = this.myMenu.id;
      activeModal.componentInstance.category_id = this.category_id;
    }

    addItem() {
      const activeModal = this.modalService.open(AddItemModalComponent, { size: 'lg', container: 'nb-layout' });
      var self = this;
      activeModal.close = function() {
        self.fetchItems();
      };
      activeModal.componentInstance.category_id = this.category_id;
    }

    onDelete(event) {
      var self = this;
      if (event.is_category) {
        this.api_service.deleteCategory(event.category_id).subscribe(
          res => {
              if (res) {
                  if (!res.err) {
                    this.toastrService.info('Deleted successfully!');  
                    self.fetchCategory(event.menu_id);
                  } else {
                    this.toastrService.error(res.msg);
                  }
              } else {
                  this.toastrService.error('Cannot fetch items!');
              }
          });
      } else if (event.is_item) {
        this.api_service.deleteItem(event.item_id).subscribe(
          res => {
              if (res) {
                  if (!res.err) {
                    this.toastrService.info('Deleted successfully!');  
                    self.fetchItems();
                  } else {
                    this.toastrService.error(res.msg);
                  }
              } else {
                  this.toastrService.error('Cannot fetch items!');
              }
          });
      }
    }

    onEdit(event) {
      Utils.logs('on edit item')
      var self = this;
      if (event.is_category) {
        this.api_service.updateCategory(event.category_id, event.menu_id, event.name, event.thumbnail, 0, event.vendor_id).subscribe(
          res => {
              if (res) {
                  if (!res.err) {
                    this.toastrService.info('Updated successfully!');  
                    self.fetchCategory(event.menu_id);
                  } else {
                    this.toastrService.error(res.msg);
                  }
              } else {
                  this.toastrService.error('Cannot fetch items!');
              }
          });
      } else if (event.is_item) {
        this.api_service.updateItem(event.item_id, event.category_id, event.name, event.description, event.price, event.tax, event.thumbnail, event.is_available, event.is_static, event.is_fast_line, event.is_in_seat).subscribe(
          res => {
              if (res) {
                  if (!res.err) {
                    this.toastrService.info('Updated successfully!');  
                    self.fetchItems();
                  } else {
                    this.toastrService.error(res.msg);
                  }
              } else {
                  this.toastrService.error('Cannot fetch items!');
              }
          });
      }
    }
    submitChanges() {
      if (this.itemDetailForm.controls.itemName.invalid) return;
      if (this.itemDetailForm.controls.itemDescription.invalid) return;
      if (this.itemDetailForm.controls.itemPrice.invalid) return;
      if (this.itemDetailForm.controls.itemTax.invalid) return;

      this.showSpinner = true
      this.itemDetailForm.value.isStatic = (this.itemDetailForm.value.isStatic) ? 1 : 0;
      this.itemDetailForm.value.isFastLine = (this.itemDetailForm.value.isFastLine) ? 1 : 0;
      this.itemDetailForm.value.isInSeat = (this.itemDetailForm.value.isInSeat) ? 1 : 0;
      // console.log(this.itemDetailForm.value.isStatic + '  ' + this.itemDetailForm.value.isFastLine + '  ' + this.itemDetailForm.value.isInSeat);

      const _that = this;
  
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
    }

    callApi(_that) {
      if (_that.linkThunbnail == undefined || _that.linkThunbnail == null) _that.linkThunbnail = '';

      _that.api_service.updateItem(_that.item_id, _that.category_id, _that.itemDetailForm.value.itemName, 
        _that.itemDetailForm.value.itemDescription, _that.itemDetailForm.value.itemPrice, _that.itemDetailForm.value.itemTax, 
        _that.linkThunbnail, _that.itemStatus, _that.itemDetailForm.value.isStatic, _that.itemDetailForm.value.isFastLine, 
        _that.itemDetailForm.value.isInSeat).subscribe(
        res => {
            this.showSpinner = false
            if (res) {
                if (!res.err) {
                  _that.toastrService.info('Updated successfully!');  
                  for (var item in _that.mnu_item) {
                    if (_that.mnu_item[item].item_id == _that.item_id) {
                      _that.mnu_item[item]={title: _that.itemDetailForm.value.itemName, is_item: true, item_id: _that.item_id, 
                        menu_id: _that.myMenu.id, category_id: _that.category_id, icon: 'nb-arrow-thin-right', 
                        thumbnail:_that.linkThunbnail, description: _that.itemDetailForm.value.itemDescription, 
                        price: _that.itemDetailForm.value.itemPrice, tax: _that.itemDetailForm.value.itemTax, is_available: _that.itemStatus, 
                        is_static: _that.itemDetailForm.value.isStatic, is_fast_line: _that.itemDetailForm.value.isFastLine, is_in_seat: _that.itemDetailForm.value.isInSeat};
                      return;
                    }
                  }
                } else {
                  _that.toastrService.error(res.msg);
                }
            } else {
              _that.toastrService.error('Cannot fetch items!');
            }
            _that.uploader.clearQueue()
        });
    }

    readURL(event) {
      const tempItem = this.uploader.queue[this.uploader.queue.length-1]
      this.uploader.clearQueue()
      this.uploader.queue[0] = tempItem
      document.getElementById('menu-item-icon').setAttribute('src', URL.createObjectURL(event.target.files[0]));
    }

    addItemsFromAppetize() {
      if (this.mnu_category.length>0) {
        this.api_service.addItemsFromAppetize(this.vendorID, this.mnu_category[this.selectedCategoryIndex].category_id).subscribe(res => {
          if (res) {
            if (!res.err && res.response) {
              this.fetchMenu();
            } else {
              this.toastrService.error('Cannot fetch items!');
            }
          } else {
            this.toastrService.error('Cannot fetch items!');
          }
        });
        this.smModal.hide();

      } else {
        this.toastrService.error('Add at least one category.');
      }
    }

    onRefreshNCR() {
      Utils.logs('refresh items')
      this.api_service.refreshItems().subscribe(res => {
        if (res) {
          if (!res.err && res.response) {
            this.toastrService.info('Menu items has been updated!')
          } else {
            this.toastrService.error('Cannot fetch items!');
          }
        } else {
          this.toastrService.error('Cannot fetch items!');
        }
      })
    }

  

}
