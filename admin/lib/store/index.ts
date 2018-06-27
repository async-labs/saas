import * as mobx from 'mobx';
import { observable, action, IObservableArray, runInAction } from 'mobx';

import { User } from './user';

mobx.configure({ enforceActions: true });

// TODO: Remove cached data at some point. Otherwise memory can become very big.
//       Consider removing all data when Team changed and
//       when page changed remove previous page's data after some delay.

class Store {
  @observable currentUser?: User = null;
  @observable isLoggingIn = true;

  constructor(initialState: any = {}) {
    this.setCurrentUser(initialState.user);
  }

  @action
  setCurrentUser(user) {
    if (user) {
      this.currentUser = new User(user);
    } else {
      this.currentUser = null;
    }

    this.isLoggingIn = false;
  }

  @action
  changeUserState(user) {
    this.setCurrentUser(user);
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

export { User, Store, initStore, getStore };
