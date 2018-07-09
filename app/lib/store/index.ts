import * as mobx from 'mobx';
import { observable, action, IObservableArray, runInAction, decorate } from 'mobx';

import { getTeamList } from '../api/team-member';
import { addTeam } from '../api/team-leader';

import { Post } from './post';
import { Discussion } from './discussion';
import { Team } from './team';
import { User } from './user';

mobx.configure({ enforceActions: true });

class Store {
  isServer: boolean;

  teams: IObservableArray<Team> = observable([]);

  isLoadingTeams = false;
  isInitialTeamsLoaded = false;

  currentUser?: User = null;
  currentTeam?: Team;
  currentUrl: string = '';
  isLoggingIn = true;

  constructor({ initialState = {}, isServer }: { initialState?: any; isServer: boolean }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user, !initialState.teams, initialState.teamSlug);

    if (initialState.teams) {
      this.setTeams(initialState.teams, initialState.teamSlug);
    }

    this.currentUrl = initialState.currentUrl || '';
  }

  changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  private setCurrentUser(user, isLoadTeam: boolean, selectedTeamSlug: string) {
    if (user) {
      this.currentUser = new User(user);
    } else {
      this.currentUser = null;
    }

    this.isLoggingIn = false;

    if (user && isLoadTeam) {
      this.loadTeams(selectedTeamSlug);
    }
  }

  changeUserState(user?, selectedTeamSlug?: string) {
    this.teams.clear();

    this.isInitialTeamsLoaded = false;
    this.setCurrentUser(user, true, selectedTeamSlug);
  }

  setTeams(teams: any[], selectedTeamSlug?: string) {
    const teamObjs = teams.map(t => new Team({ store: this, ...t }));

    if (teams && teams.length > 0 && !selectedTeamSlug) {
      selectedTeamSlug = teamObjs[0].slug;
    }

    this.teams.replace(teamObjs);

    if (selectedTeamSlug) {
      this.setCurrentTeam(selectedTeamSlug);
    }

    this.isInitialTeamsLoaded = true;
  }

  async addTeam({ name, avatarUrl }: { name: string; avatarUrl: string }): Promise<Team> {
    const data = await addTeam({ name, avatarUrl });
    const team = new Team({ store: this, ...data });

    runInAction(() => {
      this.teams.push(team);
    });

    return team;
  }

  async loadTeams(selectedTeamSlug?: string) {
    if (this.isLoadingTeams || this.isInitialTeamsLoaded) {
      return;
    }

    this.isLoadingTeams = true;

    try {
      const { teams = [] } = await getTeamList();

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

  setCurrentTeam(slug: string) {
    if (this.currentTeam) {
      if (this.currentTeam.slug === slug) {
        return;
      }
    }

    let found = false;

    for (let i = 0; i < this.teams.length; i++) {
      const team = this.teams[i];
      if (team.slug === slug) {
        found = true;
        team.loadInitialMembers().catch(err => console.log(err));
        this.currentTeam = team;
        break;
      }
    }

    if (!found) {
      this.currentTeam = null;
    }
  }
}

decorate(Store, {
  teams: observable,
  isLoadingTeams: observable,
  isInitialTeamsLoaded: observable,
  currentUser: observable,
  currentTeam: observable,
  currentUrl: observable,
  isLoggingIn: observable,

  changeCurrentUrl: action,
  setCurrentUser: action,
  changeUserState: action,
  setTeams: action,
  addTeam: action,
  loadTeams: action,
  setCurrentTeam: action,
});

let store: Store = null;

function initStore(initialState = {}) {
  if (!process.browser) {
    return new Store({ initialState, isServer: true });
  } else {
    if (store === null) {
      store = new Store({ initialState, isServer: false });
    }

    return store;
  }
}

function getStore() {
  return store;
}

export { Discussion, Post, Team, User, Store, initStore, getStore };
