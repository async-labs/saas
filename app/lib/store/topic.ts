import { observable, action, IObservableArray, runInAction, computed, decorate } from 'mobx';
import Router from 'next/router';

import { getDiscussionList, addDiscussion, deleteDiscussion } from '../api/team-member';
import { editTopic } from '../api/team-leader';

import { Store } from './index';
import { Discussion } from './discussion';
import { Team } from './team';

class Topic {
  _id: string;

  team: Team;
  store: Store;

  name: string;
  slug: string;
  searchDiscussionQuery: string = '';
  isProjects: boolean;
  currentDiscussion?: Discussion;
  currentDiscussionSlug?: string;
  isInitialDiscussionsLoaded = false;
  discussions: IObservableArray<Discussion> = observable([]);

  private isLoadingDiscussions = false;
  private initialDiscussionSlug: string = '';

  limit = 10;

  constructor(params) {
    Object.assign(this, params);

    if (params.initialDiscussions) {
      this.setInitialDiscussions(params.initialDiscussions);
    }
  }

  setInitialDiscussions(discussions) {
    const discussionObjs = discussions.map(
      t => new Discussion({ topic: this, store: this.store, ...t }),
    );

    this.discussions.replace(discussionObjs);
    this.isInitialDiscussionsLoaded = true;

    if (!this.currentDiscussionSlug && this.discussions.length > 0) {
      this.currentDiscussionSlug = this.discussions[0].slug;
    }

    if (this.currentDiscussionSlug) {
      this.setCurrentDiscussion(this.currentDiscussionSlug);
    }
  }

  setCurrentDiscussion(slug: string) {
    this.currentDiscussionSlug = slug;
    for (let i = 0; i < this.discussions.length; i++) {
      const discussion = this.discussions[i];

      if (discussion && discussion.slug === slug) {
        this.currentDiscussion = discussion;
        this.currentDiscussion.loadInitialPosts().catch(err => console.log(err));
        break;
      }
    }
  }

  setInitialDiscussionSlug(slug: string) {
    if (!this.initialDiscussionSlug) {
      this.initialDiscussionSlug = slug;
    }
  }

  async loadInitialDiscussions() {
    if (this.isInitialDiscussionsLoaded || this.isLoadingDiscussions) {
      return;
    }

    this.isLoadingDiscussions = true;

    try {
      const { discussions = [] } = await getDiscussionList({ topicId: this._id });

      runInAction(() => {
        this.setInitialDiscussions(discussions);
      });
    } finally {
      runInAction(() => {
        this.isLoadingDiscussions = false;
      });
    }
  }

  addDiscussionToLocalCache(data): Discussion {
    const obj = new Discussion({ topic: this, store: this.store, ...data });

    if (!obj.isPrivate || obj.memberIds.includes(this.store.currentUser._id)) {
      this.discussions.unshift(obj);
    }

    return obj;
  }

  editDiscussionFromLocalCache(data) {
    const discussion = this.discussions.find(item => item._id === data.id);
    if (discussion) {
      discussion.changeLocalCache(data);
    }
  }

  removeDiscussionFromLocalCache(discussionId: string) {
    const discussion = this.discussions.find(item => item._id === discussionId);
    this.discussions.remove(discussion);
  }

  async edit(data) {
    try {
      await editTopic({
        id: this._id,
        ...data,
      });

      runInAction(() => {
        this.name = data.name;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addDiscussion(data): Promise<Discussion> {
    const { discussion } = await addDiscussion({
      topicId: this._id,
      ...data,
    });

    return new Promise<Discussion>(resolve => {
      runInAction(() => {
        const obj = this.addDiscussionToLocalCache(discussion);
        resolve(obj);
      });
    });
  }

  async deleteDiscussion(id: string) {
    await deleteDiscussion({
      id,
    });

    runInAction(() => {
      const discussion = this.discussions.find(d => d._id === id);

      this.removeDiscussionFromLocalCache(id);

      if (this.currentDiscussion === discussion) {
        this.currentDiscussion = null;
        this.currentDiscussionSlug = null;

        if (this.discussions.length > 0) {
          const d = this.discussions[0];

          Router.push(
            `/discussions/detail?teamSlug=${this.team.slug}&topicSlug=${this.slug}&discussionSlug=${
              d.slug
            }`,
            `/team/${this.team.slug}/t/${this.slug}/d/${d.slug}`,
          );
        } else {
          Router.push(
            `/topics/detail?teamSlug=${this.team.slug}&topicSlug=${this.slug}`,
            `/team/${this.team.slug}/t/${this.slug}`,
          );
        }
      }
    });
  }

  get orderedDiscussions() {
    return this.discussions;
  }
}

decorate(Topic, {
  name: observable,
  slug: observable,
  searchDiscussionQuery: observable,
  isProjects: observable,
  currentDiscussion: observable,
  currentDiscussionSlug: observable,
  isInitialDiscussionsLoaded: observable,
  discussions: observable,
  isLoadingDiscussions: observable,

  setInitialDiscussions: action,
  setCurrentDiscussion: action,
  setInitialDiscussionSlug: action,
  loadInitialDiscussions: action,
  addDiscussionToLocalCache: action,
  editDiscussionFromLocalCache: action,
  removeDiscussionFromLocalCache: action,
  edit: action,
  addDiscussion: action,
  deleteDiscussion: action,

  orderedDiscussions: computed,
});

export { Topic };
