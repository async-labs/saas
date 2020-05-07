import * as mobx from 'mobx';
import { action, decorate, observable, runInAction } from 'mobx';

import { User } from './user';

mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;

  public currentUser?: User = null;
  public currentUrl = '';
  public isLoggingIn = true;

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
  }

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  public changeUserState(user?) {
    this.setCurrentUser(user);
  }

  private async setCurrentUser(user) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });

    } else {
      this.currentUser = null;
    }

    runInAction(() => {
      this.isLoggingIn = false;
    });
  }
}

decorate(Store, {
  currentUser: observable,
  currentUrl: observable,
  isLoggingIn: observable,

  changeCurrentUrl: action,
});

let store: Store = null;

function initStore(initialState = {}) {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return new Store({ initialState, isServer: true });
  } else {
    const win: any = window;

    if (!store) {

      const IS_DEV = process.env.NODE_ENV !== 'production';

      if (IS_DEV) {
        // save initialState globally and use saved state when initialState is empty
        // initialState becomes "empty" on some HMR
        if (!win.__INITIAL_STATE__) {
          // TODO: when store changed, save it to win.__INITIAL_STATE__. So we can keep latest store for HMR
          win.__INITIAL_STATE__ = initialState;
        } else if (Object.keys(initialState).length === 0) {
          initialState = win.__INITIAL_STATE__;
        }
      }

      store = new Store({ initialState, isServer: false });

      if (IS_DEV) {
        win.__STORE__ = store;
      }
    }

    return store || win.__STORE__;
  }
}

function getStore() {
  return (typeof window !== 'undefined' && (window as any).__STORE__) || store;
}

export { User, Store, initStore, getStore };
