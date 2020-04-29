import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/internal/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authkey': 'T1rS54ZW-pHtV-2L2idP'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  BASE_URL: any = environment.SERVER_URL + '/api/';
  apiEndPoints: any;

  constructor(private http: HttpClient) {
    this.apiEndPoints = {
      // user
      login: 'user/login',
      register: 'user/register',
      fetchAllUsers: 'user/fetch_all',
      updateUser: 'user/update',
      deleteUser: 'user/delete/:user_id',
      getChildren: 'user/getChildren/:restaurant_id',

      // restaurant
      getRestaurant: 'restaurant/get/:restaurant_id',
      getRestaurantsByClientId: 'restaurant/client/:client_id',
      updateRestaurantStatus: 'restaurant/updateStatus/:restaurant_id/:status',
      updateRestaurantPrepareTime: 'restaurant/updatePrepareTime/:restaurant_id/:prepare_time',
      addBankAccount: 'restaurant/addBank',
      updateTransactionStatus: 'restaurant/transaction/status',
      addRestaurant: 'restaurant/add',
      updateRestaurant: 'restaurant/update',
      deleteRestaurant: 'restaurant/delete/:restaurant_id',

      // menu
      addMenu: 'menu/add',
      getMenu: 'menu/get/:restaurant_id',

      // category
      addCategory: 'category/add',
      getCategory: 'category/get/:menu_id',
      updateCategory: 'category/update',
      deleteCategory: 'category/delete/:category_id',

      // items
      addItem: 'items/add',
      getItems: 'items/get/:category_id',
      updateItem: 'items/update',
      deleteItem: 'items/delete/:item_id',
      getStatistics: 'items/statistic/:restaurant_id/:duration',
      getSoldItems: 'items/sold/:restaurant_id/:duration',
      soldItems: 'items/sold',
      soldItemsStatistics: 'items/sold/statistic',

      // order
      getOrderAll: 'order/get/:restaurant_id',
      getPendingOrders: 'orders/pending/restaurant/:restaurant_id',
      getCompletedOrders: 'order/get/completed/:client_id',
      getCompletedOrdersByRunnerId: 'order/completed/runner/:runner_id',
      getOrderByID: 'order/id/:order_id',
      addOrder: 'order/add',
      updateOrderStatus: 'order/update/:order_id/:status',
      updateRunnerInOrder: 'order/runner',
      refundOrder: 'order/refund/:order_id',
      cancelOrder: 'order/cancel/:order_id',

       // charge
       authorizeCharge: 'order/charge/authorize',

      // add customer
      addCustomer: 'customer/add',

      // appetize
      addItemsFromAppetize: 'appetize/vendor/:vendor_id/category/:category_id',

      //tapin2/ncr
      refreshItems: 'ncr/venue/128/event/29642',

      // runners
      getRunners: 'runners/:client_id',
      getRunnerBySection: 'runner/section/:section/:order_id/:client_id',
      getRunnerById: 'runner/:id',
      updatePendingOrders: 'runner/pendingOrders/:runner_id',
      updateDeclinedOrders: 'runner/:id/declinedOrder/:order_id',
    };
    for (let key in this.apiEndPoints) {
      this.apiEndPoints[key] = this.BASE_URL + this.apiEndPoints[key];
    }
  }

  protected getHeaders() : { headers: HttpHeaders } {
    return {headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authkey': 'T1rS54ZW-pHtV-2L2idP'
    })};
  }

  get(path: string): Observable<any> {
    return this.http
      .get<any>(`${this.BASE_URL}${path}`, this.getHeaders())
      .pipe(
        tap((res: any) => console.log(`request is ok`)),
        catchError(this.handleError<any>(path))
      );
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}${path}`, body, this.getHeaders())
      .pipe(
        tap((res: any) => console.log(`request is ok`)),
        catchError(this.handleError<any>(path))
      );
  }

  signInUser(username: any, password: any): Observable<any> {
    const data = {
      username: username,
      password: password,
    };
    // console.log(this.apiEndPoints.login);
    return this.http
    .post<any>(this.apiEndPoints.login, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Sign in'))
    );
  }

  fetchAllUsers(): Observable<any> {
    // console.log(this.apiEndPoints.fetchAllUsers);
    return this.http
    .get<any>(this.apiEndPoints.fetchAllUsers, this.getHeaders())
    .pipe(
      tap(_ => this.log(`request is ok`)),
      catchError(this.handleError<any>(`get users`))
    );
  }

  registerUser(user: any): Observable<any> {
    const data = {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: user.password,
      location: user.location,
      role: user.role,
      restaurant_id: user.restaurant_id
    };
    // console.log(this.apiEndPoints.register);
    return this.http
    .post<any>(this.apiEndPoints.register, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Register'))
    );
  }

  updateUser(user: any): Observable<any> {
    const data = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: user.password,
      location: user.location,
      role: user.role,
    };
    // console.log(this.apiEndPoints.updateUser);
    return this.http
    .post<any>(this.apiEndPoints.updateUser, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Update user'))
    );
  }

  deleteUser(id: any): Observable<any> {
    const url = this.apiEndPoints.deleteUser.replace(':user_id', id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('delete user'))
    );
  }

  getChildren(restaurant_id: any): Observable<any> {
    const url = this.apiEndPoints.getChildren.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('get children'))
    );
  }

  addRestaurant(restaurant: any): Observable<any> {
    const data = {
      client_id: restaurant.client_id,
      name: restaurant.name,
      photo: restaurant.photo,
      prepare_time: restaurant.prepare_time,
      tnx_enabled: restaurant.tnx_enabled,
      tnx_options: restaurant.tnx_options,
      location: restaurant.location,
    };
    // console.log(this.apiEndPoints.addRestaurant);
    return this.http
    .post<any>(this.apiEndPoints.addRestaurant, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add Restaurant'))
    );
  }

  updateRestaurant(restaurant: any): Observable<any> {
    const data = {
      client_id: restaurant.client_id,
      name: restaurant.name,
      photo: restaurant.photo,
      prepare_time: restaurant.prepare_time,
      tnx_enabled: restaurant.tnx_enabled,
      tnx_options: restaurant.tnx_options,
      location: restaurant.location,
      restaurant_id: restaurant.restaurant_id
    };
    // console.log(this.apiEndPoints.updateRestaurant);
    return this.http
    .post<any>(this.apiEndPoints.updateRestaurant, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Update Restaurant'))
    );
  }

  deleteRestaurant(restaurantId: any): Observable<any> {
    const url = this.apiEndPoints.deleteRestaurant.replace(':restaurant_id', restaurantId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Delete Restaurant'))
    );
  }

  getRestaurant(restaurant_id: any): Observable<any> {
    const url = this.apiEndPoints.getRestaurant.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get Restaurant'))
    );
  }

  getRestaurantsByClientId(clientId: any): Observable<any> {
    const url = this.apiEndPoints.getRestaurantsByClientId.replace(':client_id', clientId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get Restaurant'))
    );
  }

  updateRestaurantStatus(restaurant_id, status): Observable<any> {
    let url = this.apiEndPoints.updateRestaurantStatus.replace(':restaurant_id', restaurant_id);
    url = url.replace(':status', status);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`request is ok`)),
      catchError(this.handleError<any>(`Update restaurant's status`))
    );
  }

  updateRestaurantPrepareTime(restaurant_id, prepare_time): Observable<any> {
    let url = this.apiEndPoints.updateRestaurantPrepareTime.replace(':restaurant_id', restaurant_id);
    url = url.replace(':prepare_time', prepare_time);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`request is ok`)),
      catchError(this.handleError<any>(`Update restaurant's preparation time`))
    );
  }

  addBankAccount(restaurant_id: any, account_number : any, routing_number: any, account_holder_name: any): Observable<any> {
    const data = {
      restaurant_id: restaurant_id,
      routing_number: routing_number,
      account_number: account_number,
      account_holder_name: account_holder_name,
    };
    // console.log(this.apiEndPoints.addBankAccount);
    return this.http
    .post<any>(this.apiEndPoints.addBankAccount, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add Bank Account'))
    );
  }
  
  updateTransactionStatus(restaurant_id, tnx_enabled, map_pin_id): Observable<any> {
    const data = {
      restaurant_id: restaurant_id,
      tnx_enabled: tnx_enabled,
      map_pin_id: map_pin_id
    };
    // console.log(this.apiEndPoints.updateTransactionStatus);
    return this.http
    .post<any>(this.apiEndPoints.updateTransactionStatus, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Update transaction status'))
    );
  }

  getMenu(restaurant_id): Observable<any> {
    const url = this.apiEndPoints.getMenu.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`request is ok`)),
      catchError(this.handleError<any>(`get menu`))
    );
  }

  addMenu(name: any, restaurant_id: any): Observable<any> {
    const data = {
      menu_name: name,
      restaurant_id: restaurant_id,
    };
    // console.log(this.apiEndPoints.addMenu);
    return this.http
    .post<any>(this.apiEndPoints.addMenu, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add menu'))
    );
  }

  getCategory(menu_id): Observable<any> {
    const url = this.apiEndPoints.getCategory.replace(':menu_id', menu_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`fetch category`)),
      catchError(this.handleError<any>(`request is ok`))
    );
  }

  addCategory(name: any, menu_id: any, thumbnail: any): Observable<any> {
    const data = {
      category_name: name,
      menu_id: menu_id,
      photo: thumbnail,
      is_deleted: false,
    };
    // console.log(this.apiEndPoints.addCategory);
    return this.http
    .post<any>(this.apiEndPoints.addCategory, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add category'))
    );
  }

  updateCategory(category_id: any, menu_id: any, name: any, thumbnail: any, is_deleted: number = 0, vendor_id: number = 0): Observable<any> {
    const data = {
      category_id: category_id,
      menu_id: menu_id,
      category_name: name,
      photo: thumbnail,
      vendor_id: vendor_id,
      is_deleted: is_deleted
    };
    // console.log(this.apiEndPoints.updateCategory);
    return this.http
    .post<any>(this.apiEndPoints.updateCategory, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Update Category'))
    );
  }

  deleteCategory(category_id: any): Observable<any> {
    const url = this.apiEndPoints.deleteCategory.replace(':category_id', category_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Delete Category'))
    );
  }

  getItems(category_id): Observable<any> {
    const url = this.apiEndPoints.getItems.replace(':category_id', category_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`request is ok`)),
      catchError(this.handleError<any>(`Get items`))
    );
  }

  addItem(category_id: any, name: any, description, price: any, tax: any, thumbnail: any, status: any, is_static: number, is_fast_line: number, is_in_seat: number): Observable<any> {
    const data = {
      category_id: category_id,
      name: name,
      description: description,
      price: price,
      tax: tax,
      photo: thumbnail,
      status: status,
      static: is_static,
      fast_line: is_fast_line,
      in_seat: is_in_seat,
    };
    // console.log(this.apiEndPoints.addItem);
    // console.log(data);
    return this.http
    .post<any>(this.apiEndPoints.addItem, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add item'))
    );
  }

  updateItem(item_id: any, category_id: any, name: any, description: any, price: any, tax: any, thumbnail: any, status: any, is_static: number, is_fast_line: number, is_in_seat: number, is_deleted: number = 0): Observable<any> {
    const data = {
      item_id: item_id,
      category_id: category_id,
      name: name,
      description: description,
      price: price,
      tax: tax,
      thumbnail: thumbnail,
      status: status,
      static: is_static,
      fast_line: is_fast_line,
      in_seat: is_in_seat,
      is_deleted: is_deleted,
    }
    // console.log(this.apiEndPoints.updateItem);
    // console.log(data);
    return this.http
    .post<any>(this.apiEndPoints.updateItem, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Update Item'))
    );
  }

  deleteItem(item_id: any): Observable<any> {
    const url = this.apiEndPoints.deleteItem.replace(':item_id', item_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`deleteItem`)),
      catchError(this.handleError<any>(`Delete item`))
    );
  }

  getStatistics(restaurant_id, duration: any): Observable<any> {
    let url = this.apiEndPoints.getStatistics.replace(':duration', duration);
    url = url.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getStatistics`)),
      catchError(this.handleError<any>(`Fetch statistics`))
    );
  }

  getSoldItems(restaurant_id, duration: any): Observable<any> {
    let url = this.apiEndPoints.getSoldItems.replace(':duration', duration);
    url = url.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getSoldItems`)),
      catchError(this.handleError<any>(`Fetched sold items`))
    );
  }

  soldItems(restaurant_id: any, start_date: any, end_date: any): Observable<any> {
    const data = {
      restaurant_id: restaurant_id,
      start_date: start_date,
      end_date: end_date
    }
    // console.log(this.apiEndPoints.soldItems);
    // console.log(data);
    return this.http
    .post<any>(this.apiEndPoints.soldItems, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get Sold Items'))
    );
  }

  soldItemsStatistics(restaurant_id: any, start_date: any, end_date: any): Observable<any> {
    const data = {
      restaurant_id: restaurant_id,
      start_date: start_date,
      end_date: end_date
    }
    // console.log(this.apiEndPoints.soldItemsStatistics);
    // console.log(data);
    return this.http
    .post<any>(this.apiEndPoints.soldItemsStatistics, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get Sold Items Statistics'))
    );
  }

  getOrderAll(restaurant_id: any): Observable<any> {
    const url = this.apiEndPoints.getOrderAll.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getOrderAll`)),
      catchError(this.handleError<any>(`Fetch orders`))
    );
  }

  getPendingOrders(restaurant_id: any): Observable<any> {
    const url = this.apiEndPoints.getPendingOrders.replace(':restaurant_id', restaurant_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getPendingOrders`)),
      catchError(this.handleError<any>(`Fetch pending orders`))
    );
  }

  getCompletedOrders(client_id: any): Observable<any> {
    let url = this.apiEndPoints.getCompletedOrders.replace(':client_id', client_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getCompletedOrders`)),
      catchError(this.handleError<any>(`Fetch completed orders`))
    );
  }

  getCompletedOrdersByRunnerId(runnerId: number): Observable<any> {
    const url = this.apiEndPoints.getCompletedOrdersByRunnerId.replace(':runner_id', runnerId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getCompletedOrdersByRunnerId`)),
      catchError(this.handleError<any>(`Fetch completed orders`))
    );
  }

  getOrderByID(id: any): Observable<any> {
    const url = this.apiEndPoints.getOrderByID.replace(':order_id', id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`getOrderByID`)),
      catchError(this.handleError<any>(`Fetch order by id.`))
    );
  }

  updateOrderStatus(id: any, status: any): Observable<any> {
    let url = this.apiEndPoints.updateOrderStatus.replace(':order_id', id);
    url = url.replace(':status', status);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`updateOrderStatus`)),
      catchError(this.handleError<any>(`Order status`))
    );
  }

  updateRunnerInOrder(orderId: any, runnerId: any, isOrderAccepted = ''): Observable<any> {
    const data = {
      order_id: orderId,
      runner_id: runnerId,
      order_status: isOrderAccepted
    };
    return this.http
    .post<any>(this.apiEndPoints.updateRunnerInOrder, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('updateRunnerInOrder'))
    );
  }

  refundOrder(id: any): Observable<any> {
    const url = this.apiEndPoints.refundOrder.replace(':order_id', id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`refundOrder`)),
      catchError(this.handleError<any>(`Refund order.`))
    );
  }

  cancelOrder(id: any): Observable<any> {
    const url = this.apiEndPoints.cancelOrder.replace(':order_id', id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`cancelOrder`)),
      catchError(this.handleError<any>(`Cancel order.`))
    );
  }

  // Authorize charge
  authorizeCharge(user_id: any, order_total: any, restaurant_id: any, order_id: any, last4: any, order_type: string, source: string, apple_pay_id: string, customer_name: string): Observable<any> {
    const data = {
      user_id: user_id,
      order_total: order_total,
      restaurant_id: restaurant_id,
      order_id: order_id,
      last4: last4,
      order_type: order_type,
      source: source,
      apple_pay_id: apple_pay_id,
      customer_name: customer_name
    };
    // console.log(this.apiEndPoints.authorizeCharge);
    // console.log(data);
    return this.http
    .post<any>(this.apiEndPoints.authorizeCharge, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Authorize charge'))
    );
  }

  fileUpload(formdata: any) {
    // console.log('uploading file....');
    const req = new HttpRequest('POST', 'http://localhost:3000/api/fileupload', formdata, {
      reportProgress: true
    });
    return this.http.request(req);
  }

  // Customer
  addCustomer(user_id: any, name: any, email: any, token: any): Observable<any> {
    const data = {
      user_id: user_id,
      name: name,
      email: email,
      token: token,
    };
    // console.log(this.apiEndPoints.addCustomer);
    return this.http
    .post<any>(this.apiEndPoints.addCustomer, data, httpOptions)
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Add Customer'))
    );
  }

  addItemsFromAppetize(vendorId: number, categoryId: number): Observable<any> {
    const url = this.apiEndPoints.addItemsFromAppetize.replace(':vendor_id', vendorId).replace(':category_id', categoryId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`addItemsFromAppetize`)),
      catchError(this.handleError<any>(`Fetch items from appetize`))
    );
  }

  refreshItems(): Observable<any> {
    const url = this.apiEndPoints.refreshItems;
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap(_ => this.log(`refreshItems`)),
      catchError(this.handleError<any>(`Fetch items from tapin2`))
    );
  }

  getRunners(client_id: any): Observable<any> {
    const url = this.apiEndPoints.getRunners.replace(':client_id', client_id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get Runners'))
    );
  }

  getRunnerBySection(section: any, orderId: number, clientId: number): Observable<any> {
    const url = this.apiEndPoints.getRunnerBySection.replace(':section', section).replace(':order_id', orderId).replace(':client_id', clientId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get runner by section'))
    );
  }

  getRunnerById(id: any): Observable<any> {
    const url = this.apiEndPoints.getRunnerById.replace(':id', id);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('Get runner by id'))
    );
  }

  updatePendingOrders(runnerId: number): Observable<any> {
    const url = this.apiEndPoints.updatePendingOrders.replace(':runner_id', runnerId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('updatePendingOrders'))
    );
  }

  updateDeclinedOrders(runnerId: number, orderId: number): Observable<any> {
    const url = this.apiEndPoints.updateDeclinedOrders.replace(':id', runnerId).replace(':order_id', orderId);
    // console.log(url);
    return this.http
    .get<any>(url, this.getHeaders())
    .pipe(
      tap((res: any) => this.log(`request is ok`)),
      catchError(this.handleError<any>('updateDeclinedOrders'))
    );
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    // console.log(message);
  }
}
