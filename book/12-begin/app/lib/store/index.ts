import * as mobx from 'mobx';
import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';

// 13
// import io from 'socket.io-client';

import { addTeam } from '../api/team-leader';
import { getTeamList } from '../api/team-member';

import { Discussion } from './discussion';
import { Post } from './post';
import { Team } from './team';
import { User } from './user';

mobx.configure({ enforceActions: 'observed' });

import { IS_DEV } from '../consts';
// 13
// import { IS_DEV, URL_API } from '../consts';

class Store {
  public isServer: boolean;

  public teams: IObservableArray<Team> = observable([]);

  public isLoadingTeams = false;
  public isInitialTeamsLoaded = false;

  public currentUser?: User = null;
  public currentTeam?: Team;
  public currentUrl = '';
  public isLoggingIn = true;

  // 13
  // public socket: SocketIOClient.Socket;

  constructor({
    initialState = {},
    // 13
    // socket = null,
    isServer,
  }: {
    // eslint-disable-next-line
    initialState?: any;
    // 13
    // socket?: SocketIOClient.Socket;
    isServer: boolean;
  }) {
    this.isServer = !!isServer;

    this.setCurrentUser(initialState.user, !initialState.teams, initialState.teamSlug);

    if (initialState.teams) {
      this.setTeams(initialState.teams, initialState.teamSlug);
    }

    this.currentUrl = initialState.currentUrl || '';

    // 13
    // this.socket = socket;

    // if (socket) {
    //   socket.on('teamEvent', this.handleTeamRealtimeEvent);

    //   socket.on('disconnect', () => {
    //     console.log('socket: ## disconnected');
    //   });

    //   socket.on('reconnect', attemptNumber => {
    //     console.log('socket: $$ reconnected', attemptNumber);

    //     if (this.currentTeam) {
    //       this.currentTeam.leaveSocketRoom();

    //       this.loadCurrentTeamData();

    //       setTimeout(() => {
    //         this.currentTeam.joinSocketRoom();
    //       }, 500);
    //     }
    //   });
    // }
  }

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  public changeUserState(user?, selectedTeamSlug?: string) {
    this.teams.clear();

    this.isInitialTeamsLoaded = false;
    this.setCurrentUser(user, true, selectedTeamSlug);
  }

  // eslint-disable-next-line
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
    const data = await addTeam({ name, avatarUrl });
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
        // 13
        // team.joinSocketRoom();
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

  private async setCurrentUser(user, isLoadTeam: boolean, selectedTeamSlug: string) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });

      // 13
      // if (this.socket && this.socket.disconnected) {
      //   this.socket.connect();
      // }
    } else {
      this.currentUser = null;
      // 13
      // if (this.socket && this.socket.connected) {
      //   this.socket.disconnect();
      // }
    }

    runInAction(() => {
      this.isLoggingIn = false;
    });

    if (user && isLoadTeam) {
      this.loadTeams(selectedTeamSlug);
    }
  }

  // 13
  // private handleTeamRealtimeEvent = data => {
  //   console.log('team realtime event', data);
  //   const { action: actionName } = data;

  //   if (actionName === 'added') {
  //     this.addTeamToLocalCache(data.team);
  //   } else if (actionName === 'edited') {
  //     this.editTeamFromLocalCache(data.team);
  //   } else if (actionName === 'deleted') {
  //     this.removeTeamFromLocalCache(data.id);
  //   }
  // };

  private loadCurrentTeamData() {
    if (this.currentTeam) {
      this.currentTeam
        .loadInitialMembers()
        .catch((err) => console.error('Error while loading Users', err));

      this.currentTeam
        .loadDiscussions()
        .catch((err) => console.error('Error while loading Discussions', err));
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
  addTeam: action,
  loadTeams: action,
  setCurrentTeam: action,
});

let store: Store = null;

function initStore(initialState = {}) {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return new Store({ initialState, isServer: true });
  } else {
    // eslint-disable-next-line
    const win: any = window;

    if (!store) {
      // 13
      // const globalStore: Store = win.__STORE__;

      if (IS_DEV) {
        // save initialState globally and use saved state when initialState is empty
        // initialState becomes "empty" on some HMR
        if (!win.__INITIAL_STATE__) {
          // TODO: when store changed, save it to win.__INITIAL_STATE__. So we can keep latest store for HMR
          win.__INITIAL_STATE__ = initialState;
        } else if (Object.keys(initialState).length === 0) {
          initialState = win.__INITIAL_STATE__;
        }

        // 13
        // if (globalStore && globalStore.socket) {
        //   globalStore.socket.removeAllListeners();
        //   globalStore.socket.disconnect();
        // }
      }

      // 13
      // const socket = io(URL_API);

      store = new Store({ initialState, isServer: false });
      // 13
      // store = new Store({ initialState, isServer: false, socket });

      if (IS_DEV) {
        win.__STORE__ = store;
      }
    }

    return store || win.__STORE__;
  }
}

function getStore() {
  // eslint-disable-next-line
  return (typeof window !== 'undefined' && (window as any).__STORE__) || store;
}

export { Discussion, Post, Team, User, Store, initStore, getStore };
