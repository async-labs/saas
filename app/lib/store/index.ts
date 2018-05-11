import * as mobx from 'mobx';
import { observable, action, IObservableArray, runInAction } from 'mobx';
import isMatch from 'lodash/isMatch';

import { getTeamList, getNotificationList, deleteNotifications } from '../api/team-member';

import { Message } from './message';
import { Discussion } from './discussion';
import { Topic } from './topic';
import { Team } from './team';
import { User } from './user';
import { Notification } from './notification';

mobx.configure({ enforceActions: true });

class Async {
  @observable teams: IObservableArray<Team> = <IObservableArray>[];
  @observable notifications: IObservableArray<Notification> = <IObservableArray>[];

  @observable isLoadingTeams = false;
  @observable isInitialTeamsLoaded = false;

  @observable currentUser?: User;
  @observable currentTeam?: Team;
  @observable isLoggingIn = true;

  getTeamBySlug(slug: string) {
    return this.teams.find(e => e.slug === slug);
  }

  @action
  async changeUserState(user?, selectedTeamSlug?: string) {
    if (user) {
      store.currentUser = new User(user);
      this.loadTeams(selectedTeamSlug);
      this.loadNotifications();
    }

    this.isLoggingIn = false;
  }

  @action
  async loadTeams(selectedTeamSlug?: string) {
    if (this.isLoadingTeams) {
      return;
    }

    this.isLoadingTeams = true;

    try {
      const { teams = [] } = await getTeamList();
      const teamObjs = teams.map(t => new Team(t));

      runInAction(() => {
        if (teams && teams.length > 0 && !selectedTeamSlug) {
          selectedTeamSlug = teamObjs[0].slug;
        }

        this.teams.replace(teamObjs);

        if (selectedTeamSlug) {
          this.setCurrentTeam(selectedTeamSlug);
        }

        this.isLoadingTeams = false;
        this.isInitialTeamsLoaded = true;
      });
    } catch (error) {
      console.error(error);
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
        team.loadTopics();
        team.loadMembers();
        this.currentTeam = team;
        break;
      }
    }
  }

  @action
  async loadNotifications() {
    try {
      const { notifications = [] } = await getNotificationList();
      const notificationObjs = notifications.map(t => new Notification({ ...t }));

      runInAction(() => {
        this.notifications.replace(notificationObjs);
      });
    } catch (error) {
      console.error(error);
    }
  }

  @action
  async deleteNotification(params) {
    if (Object.keys(params).length === 0) {
      return;
    }

    const objs: Notification[] = [];
    for (let i = 0; i < this.notifications.length; i++) {
      const not = this.notifications[i];
      if (isMatch(not, params) && !not.isDeleting) {
        objs.push(this.notifications[i]);
      }
    }

    if (objs.length === 0) {
      return;
    }

    try {
      objs.forEach(o => (o.isDeleting = true));
      await deleteNotifications(objs.map(o => o._id));

      runInAction(() => {
        objs.forEach(o => this.notifications.remove(o));
      });
    } catch (error) {
      objs.forEach(o => (o.isDeleting = false));
      console.error(error);
    }
  }

  hasNotification(params): boolean {
    if (Object.keys(params).length === 0) {
      return false;
    }

    for (let i = 0; i < this.notifications.length; i++) {
      if (isMatch(this.notifications[i], params)) {
        return true;
      }
    }

    return false;
  }
}

let store: Async;

function getStore() {
  if (!process.browser) {
    return new Async();
  }

  if (!store) {
    store = new Async();
  }

  return store;
}

export { getStore, Discussion, Message, Topic, Team, User, Notification };
