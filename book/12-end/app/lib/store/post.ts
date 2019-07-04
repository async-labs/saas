import { action, computed, decorate, observable, runInAction } from 'mobx';

import { editPost } from '../api/team-member';

import { Discussion, Store, User } from './index';

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

  get user(): User {
    return this.discussion.team.members.get(this.createdUserId) || null;
  }

  public changeLocalCache(data) {
    this.content = data.content;
    this.htmlContent = data.htmlContent;
    this.isEdited = true;
    this.lastUpdatedAt = data.lastUpdatedAt;
  }

  public async edit(data) {
    // 13
    // console.log(this.store.socket.id);

    try {
      await editPost({
        id: this._id,
        content: data.content,
        // 13
        // socketId: (this.store.socket && this.store.socket.id) || null,
      });

      runInAction(() => {
        this.changeLocalCache(data);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

decorate(Post, {
  isEdited: observable,
  content: observable,
  htmlContent: observable,
  lastUpdatedAt: observable,

  user: computed,
  changeLocalCache: action,
  edit: action,
});
