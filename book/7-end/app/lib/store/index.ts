import * as mobx from 'mobx';
import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import { useStaticRendering } from 'mobx-react'

import { addTeamApiMethod } from '../api/team-leader';
import { getTeamListApiMethod } from '../api/team-member';

import { User } from './user';
import { Team } from './team';

useStaticRendering(typeof window === 'undefined');

mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;

  public currentUser?: User = null;
  public currentUrl = '';

  public teams: IObservableArray<Team> = observable([]);
  public isLoadingTeams = false;
  public isInitialTeamsLoaded = false;
  public currentTeam?: Team;

  constructor({
    initialState = {},
    isServer,
  }: {
    initialState?: any;
    isServer: boolean;
  }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user);

    this.currentUrl = initialState.currentUrl || '';

    if (initialState.teams) {
      this.setTeams(initialState.teams, initialState.teamSlug);
    }
  }

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  private async setCurrentUser(user) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });

    } else {
      this.currentUser = null;
    }
  }

  public setTeams(teams: any[], selectedTeamSlug?: string) {
    const teamObjs = teams.map((t) => new Team({ store: this, ...t }));

    if (teams && teams.length > 0 && !selectedTeamSlug) {
      selectedTeamSlug = teamObjs[0].slug;
    }

    this.teams.replace(teamObjs);

    if (selectedTeamSlug) {
      this.setCurrentTeam(selectedTeamSlug);
    }

    this.isInitialTeamsLoaded = true;
  }

  public async addTeam({ name, avatarUrl }: { name: string; avatarUrl: string }): Promise<Team> {
    const data = await addTeamApiMethod({ name, avatarUrl });
    const team = new Team({ store: this, ...data });

    runInAction(() => {
      this.teams.push(team);
    });

    return team;
  }

  public async loadTeams(selectedTeamSlug?: string) {
    if (this.isLoadingTeams || this.isInitialTeamsLoaded) {
      return;
    }

    this.isLoadingTeams = true;

    try {
      const { teams = [] } = await getTeamListApiMethod();

      runInAction(() => {
        this.setTeams(teams, selectedTeamSlug);
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isLoadingTeams = false;
      });
    }
  }

  public setCurrentTeam(slug: string) {
    if (this.currentTeam) {
      if (this.currentTeam.slug === slug) {
        return;
      }
    }

    let found = false;

    for (const team of this.teams) {
      if (team.slug === slug) {
        found = true;
        this.currentTeam = team;
        this.loadCurrentTeamData();
        break;
      }
    }

    if (!found) {
      this.currentTeam = null;
    }
  }

  public addTeamToLocalCache(data): Team {
    const teamObj = new Team({ user: this.currentUser, store: this, ...data });
    this.teams.unshift(teamObj);

    return teamObj;
  }

  public editTeamFromLocalCache(data) {
    const team = this.teams.find((item) => item._id === data._id);

    if (team) {
      if (data.memberIds && data.memberIds.includes(this.currentUser._id)) {
        team.changeLocalCache(data);
      } else {
        this.removeTeamFromLocalCache(data._id);
      }
    } else if (data.memberIds && data.memberIds.includes(this.currentUser._id)) {
      this.addTeamToLocalCache(data);
    }
  }

  public removeTeamFromLocalCache(teamId: string) {
    const team = this.teams.find((t) => t._id === teamId);

    this.teams.remove(team);
  }

  private loadCurrentTeamData() {
    if (this.currentTeam) {
      this.currentTeam
        .loadInitialMembers()
        .catch((err) => console.error('Error while loading Users', err));
    }
  }
}

decorate(Store, {
  currentUser: observable,
  currentUrl: observable,
  teams: observable,
  isLoadingTeams: observable,
  isInitialTeamsLoaded: observable,
  currentTeam: observable,

  changeCurrentUrl: action,
  addTeam: action,
  loadTeams: action,
  setCurrentTeam: action,
});

let store: Store = null;

function initializeStore(initialState = {}) {
  const isServer = typeof window === 'undefined';

  const _store = (store !== null && store !== undefined) ? store : new Store({ initialState, isServer });

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') {
    return _store
  }
  // Create the store once in the client
  if (!store) {
    store = _store
  }

  console.log(_store);

  return _store
}

function getStore() {
  return store;
}

export { Team, User, Store, initializeStore, getStore };
