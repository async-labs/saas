import * as mobx from 'mobx';
import { observable, action, IObservableArray, runInAction } from 'mobx';

import {
  getTeamList,
} from '../api/team-member';

import { Post } from './post';
import { Discussion } from './discussion';
import { Topic } from './topic';
import { Team } from './team';
import { User } from './user';

mobx.configure({ enforceActions: true });

class Store {
  @observable teams: IObservableArray<Team> = <IObservableArray>[];

  @observable isLoadingTeams = false;
  @observable isInitialTeamsLoaded = false;

  @observable currentUser?: User = null;
  @observable currentTeam?: Team;
  @observable isLoggingIn = true;

  constructor(initialState: any = {}) {
    if (initialState.teams) {
      this.setTeams(initialState.teams, initialState.teamSlug);
    }

    this.setCurrentUser(initialState.user, initialState.teamSlug);
  }

  @action
  setCurrentUser(user, selectedTeamSlug: string) {
    if (user) {
      this.currentUser = new User(user);
    } else {
      this.currentUser = null;
    }

    this.isLoggingIn = false;

    if (user) {
      this.loadTeams(selectedTeamSlug);
    }
  }

  @action
  changeUserState(user?, selectedTeamSlug?: string) {
    this.teams.clear();

    this.isInitialTeamsLoaded = false;
    this.setCurrentUser(user, selectedTeamSlug);
  }

  @action
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

  @action
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

  @action
  setCurrentTeam(slug: string) {
    for (let i = 0; i < this.teams.length; i++) {
      const team = this.teams[i];
      if (team.slug === slug) {
        team.loadInitialTopics().catch(err => console.log(err));
        team.loadInitialMembers().catch(err => console.log(err));
        this.currentTeam = team;
        break;
      }
    }
  }

  getTeamBySlug(slug: string) {
    return this.teams.find(e => e.slug === slug);
  }
}

let store: Store = null;

function initStore(initialState = {}) {
  if (!process.browser) {
    return new Store(initialState);
  } else {
    if (store === null) {
      store = new Store(initialState);
    }

    return store;
  }
}

function getStore() {
  return store;
}

export { Discussion, Post, Topic, Team, User, Store, initStore, getStore };
