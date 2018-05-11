import { observable, action, IObservableArray, runInAction, computed } from 'mobx';

import {
  getDiscussionList,
  addDiscussion,
  deleteDiscussion,
  toggleDiscussionPin,
} from '../api/team-member';
import { editTopic } from '../api/team-leader';

import { Discussion } from './discussion';
import { Team } from './team';

export class Topic {
  _id: string;

  team: Team;

  @observable name: string;
  @observable slug: string;
  @observable searchDiscussionQuery: string = '';
  @observable isPrivate: boolean;
  @observable currentDiscussion?: Discussion;
  @observable currentDiscussionSlug?: string;
  @observable memberIds: IObservableArray<string> = <IObservableArray>[];
  @observable isInitialDiscussionsLoaded = false;

  @observable totalDiscussionCount: number;

  @observable private isLoadingDiscussions = false;
  @observable private _discussions: Map<string, Discussion> = new Map();
  @observable private discussionIds: IObservableArray<string> = <IObservableArray>[];
  @observable private initialDiscussionSlug: string = '';

  limit = 5;

  constructor(params) {
    Object.assign(this, params);
  }

  @action
  async edit(data) {
    try {
      await editTopic({ id: this._id, ...data });

      runInAction(() => {
        this.name = data.name;
        this.isPrivate = !!data.isPrivate;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @action
  async addDiscussion(data) {
    const { discussion } = await addDiscussion({ topicId: this._id, ...data });
    const discussionObj = new Discussion(discussion);

    runInAction(() => {
      this.discussionIds.unshift(discussionObj._id);
      this._discussions.set(discussionObj._id, discussionObj);
    });
  }

  @action
  async deleteDiscussion(id: string) {
    await deleteDiscussion(id);
    runInAction(() => {
      this.discussionIds.remove(id);
      this._discussions.delete(id);
    });
  }

  @action
  async toggleDiscussionPin({ id, isPinned }: { id: string; isPinned: boolean }) {
    const discussion = this._discussions.get(id);

    await toggleDiscussionPin({ id, isPinned });
    runInAction(() => {
      discussion.isPinned = isPinned;
    });
  }

  @action
  setCurrentDiscussion(slug: string) {
    this.currentDiscussionSlug = slug;
    for (let i = 0; i < this.discussionIds.length; i++) {
      const discussion = this._discussions.get(this.discussionIds[i]);
      if (discussion && discussion.slug === slug) {
        this.currentDiscussion = discussion;
        this.currentDiscussion.loadMessages();
        break;
      }
    }
  }

  @action
  setInitialDiscussionSlug(slug: string) {
    if (!this.initialDiscussionSlug) {
      this.initialDiscussionSlug = slug;
    }
  }

  @action
  async loadDiscussions() {
    if (this.isLoadingDiscussions) {
      return;
    }

    this.isLoadingDiscussions = true;

    let pinnedDiscussionCount = 0;
    let isInitialDiscussionLoaded = false;

    for (let i = 0; i < this.discussionIds.length; i++) {
      const d = this._discussions.get(this.discussionIds[i]);
      if (d.isPinned) {
        pinnedDiscussionCount++;
      }

      if (d.slug === this.initialDiscussionSlug && this.initialDiscussionSlug) {
        isInitialDiscussionLoaded = true;
      }
    }

    return new Promise(async (resolve, reject) => {
      try {
        const { discussions = [], totalCount } = await getDiscussionList({
          topicId: this._id,
          searchQuery: this.searchDiscussionQuery,
          skip: this.discussionIds.length,
          limit: this.limit,
          pinnedDiscussionCount,
          initialDiscussionSlug: this.initialDiscussionSlug,
          isInitialDiscussionLoaded,
        });

        runInAction(() => {
          this.totalDiscussionCount = totalCount;

          discussions.forEach(d => {
            if (this.discussionIds.indexOf(d._id) === -1) {
              this.discussionIds.push(d._id);
              this._discussions.set(d._id, new Discussion(d));
            }
          });

          this.isLoadingDiscussions = false;

          resolve();
        });
      } catch (error) {
        console.error(error);
        runInAction(() => {
          this.isLoadingDiscussions = false;
          reject(error);
        });
      }
    });
  }

  @action
  async loadInitialDiscussions() {
    if (this.isInitialDiscussionsLoaded) {
      return;
    }

    this.discussionIds.clear();
    this._discussions.clear();

    await this.loadDiscussions();

    runInAction(() => {
      if (!this.currentDiscussionSlug && this.discussionIds.length > 0) {
        this.currentDiscussionSlug = this._discussions.get(this.discussionIds[0]).slug;
      }

      if (this.currentDiscussionSlug) {
        this.setCurrentDiscussion(this.currentDiscussionSlug);
      }

      this.isInitialDiscussionsLoaded = true;
    });
  }

  @action
  loadMoreDiscussions() {
    this.loadDiscussions();
  }

  @action
  async searchDiscussion(query: string) {
    if (this.isLoadingDiscussions) {
      throw new Error('Loading discussions. Try again later');
    }

    this.searchDiscussionQuery = query;
    this.loadDiscussions();
  }

  @computed
  get discussions(): Discussion[] {
    return this.discussionIds.map(id => this._discussions.get(id));
  }

  @computed
  get hasMoreDiscussion() {
    return this.totalDiscussionCount > this.discussionIds.length;
  }
}
