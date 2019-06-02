import env from '../../lib/env';
import { Team } from '../../lib/store';

const { PRODUCTION_URL_API, DEVELOPMENT_URL_API, NODE_ENV } = env;
const dev = NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? DEVELOPMENT_URL_API : PRODUCTION_URL_API;

const menuOnTheRight = ({ currentTeam }: { currentTeam: Team }) => [
  {
    text: 'Your Settings',
    href: '/your-settings',
    simple: true,
  },
  {
    text: 'Team Settings',
    href: `/team-settings?teamSlug=${currentTeam.slug}`,
    as: `/team/${currentTeam.slug}/team-settings`,
    simple: true,
  },
  {
    text: 'Billing',
    href: `/billing?teamSlug=${currentTeam.slug}`,
    as: `/team/${currentTeam.slug}/billing`,
    simple: true,
  },
  {
    separator: true,
  },
  {
    text: 'Log out',
    href: `${LOG_OUT_URL}/logout`,
    as: `${LOG_OUT_URL}/logout`,
    simple: true,
  },
];

export { menuOnTheRight };
