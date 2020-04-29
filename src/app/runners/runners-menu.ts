import { NbMenuItem } from '../@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Active Orders',
    icon: 'nb-compose',
    link: `/runners/pending/`,
    home: true,
  },
  {
    title: 'Completed Orders',
    icon: 'nb-checkmark',
    link: `/runners/completed/`,
  },
];
