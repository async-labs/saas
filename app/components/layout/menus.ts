import env from '../../lib/env';
import { Team } from '../../lib/store';

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_API } = env;
const LOG_OUT_URL = dev ? 'http://localhost:8000' : PRODUCTION_URL_API;

const menuUnderTeamListLeftTL = (currentTeam: Team) => [
  {
    separator: true,
  },
  {
    text: 'Team Settings',
    href: `/settings/team-members?teamSlug=${currentTeam.slug}`,
    as: `/team/${currentTeam.slug}/settings/team-members`,
    simple: true,
  },
];

const menuUnderTeamListLeft = (teams: Team[], currentUserId: string) => {
  const hasOwnedTeam = teams.findIndex(t => t.teamLeaderId === currentUserId) !== -1;

  if (hasOwnedTeam) {
    return [];
  }

  return [
    {
      separator: true,
    },
    {
      text: 'Create new Team',
      href: '/create-team',
      simple: true,
    },
  ];
};

const getTeamOptionsMenuWithLinksLeft = ({
  teams,
  currentTeam,
  currentUserId,
}: {
  teams: Team[];
  currentTeam: Team;
  currentUserId: string;
}) => {
  const links = teams.map(t => ({
    text: t.teamLeaderId === currentUserId ? `${t.name} ( You're TL )` : `${t.name} ( You're TM )`,
    avatarUrl: t.avatarUrl,
    href: `/discussion?teamSlug=${t.slug}`,
    as: `/team/${t.slug}/discussions`,
    simple: false,
    highlighterSlug: `/team/${t.slug}/`,
  }));

  if (currentTeam.teamLeaderId === currentUserId) {
    return [...links, ...menuUnderTeamListLeftTL(currentTeam)];
  }

  return [...links, ...menuUnderTeamListLeft(teams, currentUserId)];
};

const menuUnderTeamListRight = () => [
  {
    text: 'Your Profile',
    href: '/settings/your-profile',
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

export { getTeamOptionsMenuWithLinksLeft, menuUnderTeamListRight };
