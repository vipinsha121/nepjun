import { NbMenuItem } from '../@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'New Orders',
    icon: 'nb-notifications',
    link: '/frontdesk/pending',
    home: true,
  },
  {
    title: 'Active Orders',
    icon: 'nb-compose',
    link: '/frontdesk/active',
  },
  {
    title: 'Completed Orders',
    icon: 'nb-checkmark',
    link: '/frontdesk/completed',
  },
  {
    title: 'Runners Map',
    icon: 'nb-location',
    link: '/frontdesk/map/runners',
  },
  {
    title: 'Runners',
    icon: 'nb-person',
    link: '/frontdesk/runners',
  },
];
