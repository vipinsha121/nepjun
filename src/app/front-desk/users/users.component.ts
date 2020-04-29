import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Utils } from '../../common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

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
      runner_name: {
        title: 'Name',
        type: 'string',
        filter: false,
      },
      phone_number: {
        title: 'Phone #',
        type: 'string',
        filter: false,
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  currentUser: any;

  constructor(private apiService: ApiService, 
              private toastrService: ToastrService,
              private cookieService: CookieService,
              private router: Router) { 
  }

  ngOnInit() {
    if (!(this.cookieService.check('user') && this.cookieService.get('user') != '')) {
      const redirect = '/auth/login';
      this.router.navigateByUrl(redirect);
      return;
    } else {
      this.currentUser = Utils.decodeJwt(this.cookieService.get('user'));
    }

    this.getRunners()
  }

  getRunners() {
    this.apiService.get(`runners/${this.currentUser.restaurant_id}`).subscribe(
      res => {
          if (res) {
              if (!res.err) {
                this.source.load(res.response);
              } else {
                  this.toastrService.error('Cannot fetch runners!');
              }
          } else {
              this.toastrService.error('Cannot fetch runners!');
          }
      });
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete this runner???')) {
      this.apiService.get(`runner/delete/${event.data['id']}`).subscribe(
        res => {
            if (res) {
                if (!res.err) {
                  this.toastrService.info('Successfully deleted!');
                  event.confirm.resolve();
                } else {
                    this.toastrService.error(res.msg);
                    event.confirm.reject();
                }
            } else {
                this.toastrService.error('"Delete runner" failed!');
                event.confirm.reject();
            }
        });

    } else {
      event.confirm.reject();
    }
  }

  onSaveConfirm(event): void {
    if (window.confirm('Are you sure you want to save changes?')) {
      const name = event.newData['runner_name'];
      if (name === '') {
        this.toastrService.error('You must enter a name!');
        event.confirm.reject();
        return;
      }

      const phone = event.newData['phone_number'];
      if (phone === '') {
        this.toastrService.error('You must enter a phone #!');
        event.confirm.reject();
        return;
      }

      this.apiService.post(`runner/update`, {...event.newData, id: event.data['id']}).subscribe(
        res => {
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
    if (window.confirm('Are you sure you want to add this runner?')) {
      const name = event.newData['runner_name'];
      if (name === '') {
        this.toastrService.error('You must enter a name!');
        event.confirm.reject();
        return;
      }

      const phone = event.newData['phone_number'];
      if (phone === '') {
        this.toastrService.error('You must enter a phone #!');
        event.confirm.reject();
        return;
      }

      const runner = event.newData;
      runner.restaurant_id = this.currentUser.restaurant_id;

      this.apiService.post(`runner/add`, runner).subscribe(
        res => {
            if (res) {
                if (!res.err) {
                  this.toastrService.info('Successfully added!');
                  this.getRunners()
                  event.confirm.resolve();
                } else {
                    this.toastrService.error(res.msg);
                    event.confirm.reject();
                }
            } else {
                this.toastrService.error('Registration failed!');
                event.confirm.reject();
            }
        });

    } else {
      event.confirm.reject();
    }
  }

}
