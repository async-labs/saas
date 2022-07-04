import * as mobx from 'mobx';
import { action, decorate, IObservableArray, observable } from 'mobx';
import { useStaticRendering } from 'mobx-react';
// @ts-expect-error no exported member io socket.io-client
import { io } from 'socket.io-client';

import { addTeamApiMethod, getTeamInvitationsApiMethod } from '../api/team-leader';
import { getTeamListApiMethod, getTeamMembersApiMethod } from '../api/team-member';

import { User } from './user';
import { Team } from './team';

useStaticRendering(typeof window === 'undefined');

mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;

  public currentUser?: User = null;
  public currentUrl = '';

  public currentTeam?: Team;

  public teams: IObservableArray<Team> = observable([]);

  public socket: SocketIOClient.Socket;

  constructor({
    initialState = {},
    isServer,
    socket = null,
  }: {
    initialState?: any;
    isServer: boolean;
    socket?: SocketIOClient.Socket;
  }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user);

    this.currentUrl = initialState.currentUrl || '';

    // console.log(initialState.user);

    if (initialState.teamSlug || (initialState.user && initialState.user.defaultTeamSlug)) {
      this.setCurrentTeam(
        initialState.teamSlug || initialState.user.defaultTeamSlug,
        initialState.teams,
      );
    }

    if (initialState.teams && initialState.teams.length > 0) {
      this.setInitialTeamsStoreMethod(initialState.teams);
    }

    this.socket = socket;

    if (socket) {
      socket.on('disconnect', () => {
        console.log('socket: ## disconnected');
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('socket: $$ reconnected', attemptNumber);
      });
    }
  }

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  public async setCurrentUser(user) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });
    } else {
      this.currentUser = null;
    }
  }

  public async addTeam({ name, avatarUrl }: { name: string; avatarUrl: string }): Promise<Team> {
    const data = await addTeamApiMethod({ name, avatarUrl });
    const team = new Team({ store: this, ...data });

    return team;
  }

  public async setCurrentTeam(slug: string, initialTeams: any[]) {
    if (this.currentTeam) {
      if (this.currentTeam.slug === slug) {
        return;
      }
    }

    let found = false;

    const teams = initialTeams || (await getTeamListApiMethod()).teams;

    for (const team of teams) {
      if (team.slug === slug) {
        found = true;
        this.currentTeam = new Team({ ...team, store: this });

        const users =
          team.initialMembers || (await getTeamMembersApiMethod(this.currentTeam._id)).users;

        const invitations =
          team.initialInvitations ||
          (await getTeamInvitationsApiMethod(this.currentTeam._id)).invitations;

        this.currentTeam.setInitialMembersAndInvitations(users, invitations);

        break;
      }
    }

    if (!found) {
      this.currentTeam = null;
    }
  }

  private setInitialTeamsStoreMethod(teams: any[]) {
    // console.log(initialTeams);

    const teamObjs = teams.map((t) => new Team({ store: this, ...t }));

    this.teams.replace(teamObjs);
  }
}

decorate(Store, {
  currentUser: observable,
  currentUrl: observable,
  currentTeam: observable,

  changeCurrentUrl: action,
  setCurrentUser: action,
  setCurrentTeam: action,
});

let store: Store = null;

function initializeStore(initialState = {}) {
  const isServer = typeof window === 'undefined';

  const socket = isServer
    ? null
    : io(process.env.URL_API, {
        reconnection: true,
        autoConnect: true,
        transports: ['polling', 'websocket'],
        withCredentials: true,
      });

  const _store =
    store !== null && store !== undefined ? store : new Store({ initialState, isServer, socket });

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') {
    return _store;
  }
  // Create the store once in the client
  if (!store) {
    store = _store;
  }

  // console.log(_store);

  return _store;
}

function getStore() {
  return store;
}

export { Store, initializeStore, getStore };
