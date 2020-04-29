import { NbMenuItem } from '../@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Menu',
    icon: 'nb-list',
    link: '/admin/menu',
  },
  {
    title: 'Sales',
    icon: 'nb-bar-chart',
    link: '/admin/analytics',
    home: true,
  }, 
  {
    title: 'Orders',
    icon: 'nb-compose',
    link: '/admin/orders',
    home: true,
  },
  {
    title: 'Users',
    icon: 'nb-person',
    link: '/admin/users',
  },
  {
    title: 'Settings',
    icon: 'nb-gear',
    link: '/admin/settings',
  },
];
