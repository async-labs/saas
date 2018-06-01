import { observable, action, IObservableArray, runInAction } from 'mobx';
import Router from 'next/router';

import {
  getTeamMemberList,
  addTopic,
  deleteTopic,
  inviteMember,
  removeMember,
} from '../api/team-leader';

import { getTopicList } from '../api/team-member';

import { Topic } from './topic';
import { User } from './user';
import { Store } from './index';

export class Team {
  store: Store;

  @observable private isLoadingTopics = false;
  @observable isInitialTopicsLoaded = false;

  _id: string;
  teamLeaderId: string;

  @observable slug: string;
  @observable name: string;
  @observable avatarUrl: string;
  @observable memberIds: string[];
  @observable topics: IObservableArray<Topic> = <IObservableArray>[];
  @observable privateTopics: IObservableArray<Topic> = <IObservableArray>[];
  @observable currentTopic?: Topic;

  @observable currentTopicSlug?: string;
  @observable currentDiscussionSlug?: string;

  @observable members: Map<string, User> = new Map();
  @observable private isLoadingMembers = false;
  @observable private isInitialMembersLoaded = false;

  constructor(params) {
    Object.assign(this, params);

    if (params.initialTopics) {
      this.setInitialTopics(params.initialTopics);
    }

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers);
    }
  }

  @action
  setInitialTopics(topics: any[]) {
    this.topics.clear();

    const topicObjs = topics.map(t => new Topic({ team: this, ...t }));

    this.topics.replace(topicObjs);

    if (this.currentTopicSlug) {
      this.setCurrentTopic(this.currentTopicSlug);
    }

    this.isInitialTopicsLoaded = true;
  }

  @action
  async loadInitialTopics() {
    if (this.isLoadingTopics || this.isInitialTopicsLoaded) {
      return;
    }

    this.isLoadingTopics = true;

    try {
      const { topics = [] } = await getTopicList(this._id);
      const topicObjs = topics.map(t => new Topic({ team: this, ...t }));

      runInAction(() => {
        this.topics.replace(topicObjs);

        if (this.currentTopicSlug) {
          this.setCurrentTopic(this.currentTopicSlug);
        }

        this.isLoadingTopics = false;
        this.isInitialTopicsLoaded = true;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoadingTopics = false;
      });

      throw error;
    }
  }

  @action
  setCurrentTopicAndDiscussion({
    topicSlug,
    discussionSlug,
  }: {
    topicSlug: string;
    discussionSlug: string;
  }) {
    this.currentTopicSlug = topicSlug;
    this.currentDiscussionSlug = discussionSlug;

    for (let i = 0; i < this.topics.length; i++) {
      const topic = this.topics[i];
      if (topic.slug === topicSlug) {
        topic.setInitialDiscussionSlug(discussionSlug);
        topic.currentDiscussionSlug = discussionSlug;
        topic.loadInitialDiscussions();
        this.currentTopic = topic;
        break;
      }
    }
  }

  @action
  setCurrentTopic(slug: string) {
    let found = false;
    for (let i = 0; i < this.topics.length; i++) {
      const topic = this.topics[i];
      // console.log(topic);
      if (topic.slug === slug) {
        this.currentTopicSlug = slug;
        if (this.currentDiscussionSlug) {
          topic.setInitialDiscussionSlug(this.currentDiscussionSlug);
          topic.currentDiscussionSlug = this.currentDiscussionSlug;
        }

        topic.loadInitialDiscussions().catch(err => console.log(err));
        this.currentTopic = topic;
        found = true;
        break;
      }
    }

    if (!found) {
      this.currentTopic = null;
      this.currentTopicSlug = null;
    }
  }

  @action
  async addTopic(data) {
    const { topic } = await addTopic({ teamId: this._id, ...data });
    const topicObj = new Topic({ team: this, ...topic });

    runInAction(() => {
      this.topics.unshift(topicObj);

      Router.push(
        `/topics/detail?teamSlug=${this.slug}&topicSlug=${topic.slug}`,
        `/team/${this.slug}/t/${topic.slug}`,
      );
    });
  }

  @action
  async deleteTopic(topicId: string) {
    const topic = this.topics.find(t => t._id === topicId);

    await deleteTopic(topicId);

    runInAction(() => {
      this.topics.remove(topic);

      if (this.store.currentTeam === this && this.currentTopic === topic) {
        if (this.topics.length > 0) {
          Router.push(
            `/topics/detail?teamSlug=${this.slug}&topicSlug=${this.topics[0].slug}`,
            `/team/${this.slug}/t/${this.topics[0].slug}`,
          );
        } else {
          Router.push('/');
          this.currentTopic = null;
          this.currentTopicSlug = null;
        }
      }
    });
  }

  @action
  setInitialMembers(users) {
    this.members.clear();

    for (let i = 0; i < users.length; i++) {
      this.members.set(users[i]._id, new User(users[i]));
    }

    this.isInitialMembersLoaded = true;
  }

  @action
  async loadInitialMembers() {
    if (this.isLoadingMembers || this.isInitialMembersLoaded) {
      return;
    }

    this.isLoadingMembers = true;

    try {
      const { users = [] } = await getTeamMemberList(this._id);
      runInAction(() => {
        for (let i = 0; i < users.length; i++) {
          this.members.set(users[i]._id, new User(users[i]));
        }
        this.isLoadingMembers = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoadingMembers = false;
      });

      throw error;
    }
  }

  @action
  async inviteMember(email: string) {
    return await inviteMember({ teamId: this._id, email });
  }

  @action
  async removeMember(userId: string) {
    await removeMember({ teamId: this._id, userId });

    runInAction(() => {
      this.members.delete(userId);
    });
  }
}
