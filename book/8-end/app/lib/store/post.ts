import { action, computed, decorate, observable, runInAction } from 'mobx';

import { editPostApiMethod } from '../api/team-member';

import { Store } from './index';
import { User } from './user';
import { Discussion } from './discussion';

export class Post {
  public _id: string;
  public createdUserId: string;
  public createdAt: Date;
  public discussionId: string;

  public discussion: Discussion;
  public store: Store;

  public isEdited: boolean;
  public content: string;
  public htmlContent: string;

  public lastUpdatedAt: Date;

  constructor(params) {
    Object.assign(this, params);
  }

  public async edit(data) {
    try {
      await editPostApiMethod({
        id: this._id,
        content: data.content,
        socketId: (this.store.socket && this.store.socket.id) || null,
      });

      runInAction(() => {
        this.changeLocalCache(data);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public changeLocalCache(data) {
    this.content = data.content;
    this.htmlContent = data.htmlContent;
    this.isEdited = true;
    this.lastUpdatedAt = data.lastUpdatedAt;
  }

  get user(): User {
    return this.discussion.team.members.get(this.createdUserId) || null;
  }
}

decorate(Post, {
  isEdited: observable,
  content: observable,
  htmlContent: observable,
  lastUpdatedAt: observable,

  changeLocalCache: action,
  edit: action,

  user: computed,
});
