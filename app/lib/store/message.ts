import { observable, computed, action, runInAction } from 'mobx';

import { editMessage } from '../api/team-member';

import { getStore, User, Discussion } from './index';

export class Message {
  _id: string;
  createdUserId: string;
  discussionId: string;

  discussion: Discussion;

  @observable isEdited: boolean;
  @observable content: string;

  constructor(params) {
    Object.assign(this, params);
  }

  @computed
  get user(): User {
    const store = getStore();

    if (!store.currentTeam) {
      return null;
    }

    return store.currentTeam.members.get(this.createdUserId) || null;
  }

  @action
  async edit(data) {
    try {
      await editMessage({ id: this._id, ...data });

      runInAction(() => {
        this.content = data.content;
        this.isEdited = true;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
