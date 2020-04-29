import { Component, OnInit, Input, Output, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { Utils } from '../../common';
import { UploadPhotoComponent } from './upload-photo/upload-photo.component';
import { IRestaurant, Restaurant } from '../../models';
declare var $: any;

@Component({
  selector: 'restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {
  settings = {
    mode: 'inline',
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      name: {
        title: 'Name',
        type: 'string',
      },
      location: {
        title: 'Location',
        type: 'string',
      },
      photo: {
        title: 'Image (350-150px)',
        type: 'html',
        valuePrepareFunction: (photo) => `<img id="my-restaurant-img" height="85px" width="200px" src="${photo}" />`,
        filter: false,
        editor: {
          type: 'custom',
          component: UploadPhotoComponent,
        },
      },
      tnx_enabled: {
        title: 'Transaction Enabled',
        type: 'string',
        editor: {
          type: 'list',
          config: {
            list: [
              {title: 'No', value: 'No'},
              {title: 'Yes', value: 'Yes'}
            ]
          }
        },
        filter: false,
      },
      tnx_options: {
        title: 'Transaction Options',
        type: 'string',
        valuePrepareFunction: (tnx_options) => {
          switch(tnx_options) {
            case 'BOTH' :
              return 'All';
            case 'FAST-LINE' :
              return 'Fast-Line';
            case 'IN-SEAT' :
              return 'In-Seat';
            default: 
              return 'None';
          }
        },
        editor: {
          type: 'list',
          config: {
            list: [
              {title: 'None', value: 'NONE'},
              {title: 'Fast-Line', value: 'FAST-LINE'},
              {title: 'In-Seat', value: 'IN-SEAT'},
              {title: 'All', value: 'BOTH'},
            ]
          }
        },
        filter: false,
      },
      prepare_time: {
        title: 'Preparation Time(min)',
        type: 'number',
        filter: false,
      },
    },
  };

  restaurants: any;
  restaurant: IRestaurant;
  source: LocalDataSource = new LocalDataSource();
  currentUser: any;

  constructor(private apiService: ApiService,
    private toastrService: ToastrService,
    private cookieService: CookieService,
    private router: Router) {
    }

  ngOnInit() {
    this.restaurant = new Restaurant();
    if (!(this.cookieService.check('user') && this.cookieService.get('user') !== '')) {
      const redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }
    this.getRestaurants();
  }

  getRestaurants() {
    this.apiService.getRestaurantsByClientId(this.currentUser.client_id).subscribe(
    res => {
    // console.log(res);
    if (res) {
        if (!res.err) {
          this.restaurants = res.response;
          this.source.load(this.restaurants);
        } else {
            this.toastrService.error('Cannot fetch users!');
        }
    } else {
        this.toastrService.error('Cannot fetch users!');
    }
    });
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete this concession?')) {
      this.apiService.deleteRestaurant(event.data.id).subscribe(
        res => {
            // console.log(res);
            if (res) {
                if (!res.err) {
                  this.toastrService.info('Successfully deleted!');
                  event.confirm.resolve();
                } else {
                    this.toastrService.error(res.msg);
                    event.confirm.reject();
                }
            } else {
                this.toastrService.error('Delete concession failed!');
                event.confirm.reject();
            }
        });

    } else {
      event.confirm.reject();
    }
  }

  onSaveConfirm(event): void {
    if (window.confirm('Are you sure you want to save changes?')) {
      const name = event.newData['name'];
      if (name === '') {
        this.toastrService.error('You must enter a name.');
        event.confirm.reject();
        return;
      }
      event.newData['name'] = event.newData['name'].replace(/'/g,"''");
      // console.log(event.newData['name'])

      const preparationTime = event.newData['prepare_time'];
      if (preparationTime === '') {
        event.newData['prepare_time'] = 5;
        // this.toastrService.error('You must enter a preparation time.');
        // event.confirm.reject();
        // return;
      }

      event.newData['restaurant_id'] = event.newData['id'];
      this.apiService.updateRestaurant(event.newData).subscribe(
        res => {
          // console.log(res);
          if (res) {
              if (!res.err) {
                this.toastrService.info('Successfully updated!');
                event.confirm.resolve();
              } else {
                  this.toastrService.error(res.msg);
                  event.confirm.reject();
              }
          } else {
              this.toastrService.error('Update failed!');
              event.confirm.reject();
          }
      });

    } else {
      event.confirm.reject();
    }
  }

  onCreateConfirm(event): void {
    if (window.confirm('Are you sure you want to create this concession?')) {
      const name = event.newData['name'];
      if (name === '') {
        this.toastrService.error('You must enter a name.');
        event.confirm.reject();
        return;
      }

      const photo = event.newData['photo'];
      if (photo === '') {
        this.toastrService.error('You must upload a cover image.');
        event.confirm.reject();
        return;
      }

      const preparationTime = event.newData['prepare_time'];
      if (preparationTime === '') {
        event.newData['prepare_time'] = 5;
      }

      const tnxEnabled = event.newData['tnx_enabled'];
      if (tnxEnabled === '') {
        event.newData['tnx_enabled'] = 'No';
        event.newData['tnx_options'] = 'NONE';
      } 

      const tnxOptions = event.newData['tnx_options'];
      if (tnxOptions === '') {
        event.newData['tnx_options'] = (tnxEnabled === 'Yes') ? 'BOTH' : 'NONE';
      } 

      event.newData['client_id'] = this.currentUser.client_id;
      this.apiService.addRestaurant(event.newData).subscribe(
        res => {
          // console.log(res);
          if (res) {
              if (!res.err) {
                this.getRestaurants();
                this.toastrService.info('Successfully updated!');
                event.confirm.resolve();
              } else {
                  this.toastrService.error(res.msg);
                  event.confirm.reject();
              }
          } else {
              this.toastrService.error('Update failed!');
              event.confirm.reject();
          }
      });

    } else {
      event.confirm.reject();
    }
  }

}
