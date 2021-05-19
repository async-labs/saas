import { action, computed, observable, runInAction, makeObservable } from 'mobx';

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

  public content: string;
  public htmlContent: string;

  public isEdited: boolean;
  public lastUpdatedAt: Date;

  constructor(params) {
    makeObservable(this, {
      content: observable,
      htmlContent: observable,
      isEdited: observable,
      lastUpdatedAt: observable,

      editPost: action,
      changeLocalCache: action,

      user: computed,
    });

    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.createdAt = params.createdAt;
    this.discussionId = params.discussionId;

    this.content = params.content;
    this.htmlContent = params.htmlContent;

    this.discussion = params.discussion;
    this.store = params.store;

    this.isEdited = params.isEdited;
    this.lastUpdatedAt = params.lastUpdatedAt;
  }

  public async editPost(data) {
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
