import { observable, computed, action, runInAction } from 'mobx';

import { editPost } from '../api/team-member';

import { User, Discussion } from './index';

export class Post {
  _id: string;
  createdUserId: string;
  createdAt: Date;
  discussionId: string;

  discussion: Discussion;

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
  async edit(data) {
    try {
      await editPost({ id: this._id, ...data });

      runInAction(() => {
        this.content = data.content;
        this.htmlContent = data.htmlContent;
        this.isEdited = true;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // @action
  // async uploadFile(data, file) {
  //   try {
  //     console.log(file);
  //     await uploadFile({ id: this._id, ...data }, file);

  //     runInAction(() => {
  //       this.file = data.file;
  //       this.isEdited = true;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }
}
