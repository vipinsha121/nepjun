export interface IRestaurant {
    $key?: number;
    $exists?: any;
  
    id?: number;
    name?: string;
    photo?: string;
    prepare_time?: number;
    booking_fee?: number;
    bank_account?: string;
    status?: number;
    tnx_enabled?: string;
    tnx_options?: string;
    created_at?: number;
    updated_at?: number;
    map_pin_id?: number;
}
export class Restaurant {
    id?: number;
    name?: string;
    photo?: string;
    prepare_time?: number;
    booking_fee?: number;
    bank_account?: string;
    status?: number;
    tnx_enabled?: string;
    tnx_options?: string;
    created_at?: number;
    updated_at?: number;
    map_pin_id?: number;

    constructor() {
    this.id = 0;
    this.name = '';
    this.photo = '../../../assets/images/concession-stand.jpg';
    this.prepare_time = 5;
    this.booking_fee = 15;
    this.bank_account = '';
    this.status = 0;
    this.tnx_enabled = 'No';
    this.tnx_options = 'NONE';
    this.created_at = 0;
    this.updated_at = 0;
    this.map_pin_id = 0;
    }
}