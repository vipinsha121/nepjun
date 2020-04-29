import { NbMenuItem } from '../@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Concessions',
    icon: 'nb-home',
    link: '/client/restaurant',
    home: true,
  }, {
    title: 'Menus',
    icon: 'nb-list',
    link: '/client/menu',
    home: true,
  }, {
    title: 'Sales',
    icon: 'nb-bar-chart',
    link: '/client/analytics',
    home: true,
  }, {
    title: 'Orders',
    icon: 'nb-compose',
    link: '/client/orders',
    home: true,
  },

];
