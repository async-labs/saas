// 10
// import { Team } from '../../lib/store';

import { URL_API } from '../../lib/consts';

const menuOnTheRight = () => [
// 10
// const menuOnTheRight = ({ currentTeam }: { currentTeam: Team }) => [
  {
    text: 'Your Settings',
    href: '/your-settings',
    simple: true,
  },

  // 10
  // {
  //   text: 'Team Settings',
  //   href: `/team-settings?teamSlug=${currentTeam.slug}`,
  //   as: `/team/${currentTeam.slug}/team-settings`,
  //   simple: true,
  // },

  // 11
  // {
  //   text: 'Billing',
  //   href: `/billing?teamSlug=${currentTeam.slug}`,
  //   as: `/team/${currentTeam.slug}/billing`,
  //   simple: true,
  // },
  {
    separator: true,
  },
  {
    text: 'Log out',
    href: `${URL_API}/logout`,
    as: `${URL_API}/logout`,
    simple: true,
  },
];

export { menuOnTheRight };
