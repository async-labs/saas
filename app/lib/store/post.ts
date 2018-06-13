import { observable, computed, action, runInAction } from 'mobx';

import { editPost } from '../api/team-member';

import { User, Discussion, Store } from './index';

export class Post {
  _id: string;
  createdUserId: string;
  createdAt: Date;
  discussionId: string;

  discussion: Discussion;
  store: Store;

  @observable isEdited: boolean;
  @observable content: string;
  @observable htmlContent: string;

  constructor(params) {
    Object.assign(this, params);
  }

  @computed
  get user(): User {
    return this.discussion.topic.team.members.get(this.createdUserId) || null;
  }

  @action
  changeLocalCache(data) {
    this.content = data.content;
    this.htmlContent = data.htmlContent;
    this.isEdited = true;
  }

  @action
  async edit(data) {
    try {
      await editPost({
        id: this._id,
        content: data.content,
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
