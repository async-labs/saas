import { observable, action, IObservableArray, runInAction } from 'mobx';

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

export class Team {
  @observable private isLoadingTopics = false;
  @observable isInitialTopicsLoaded = false;

  _id: string;
  teamLeaderId: string;

  @observable slug: string;
  @observable name: string;
  @observable avatarUrl: string;
  @observable topics: IObservableArray<Topic> = <IObservableArray>[];
  @observable currentTopic?: Topic;

  @observable currentTopicSlug?: string;
  @observable currentDiscussionSlug?: string;

  @observable members: Map<string, User> = new Map();
  @observable private isLoadingMembers = false;

  constructor(params) {
    Object.assign(this, params);
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
    this.currentTopicSlug = slug;

    for (let i = 0; i < this.topics.length; i++) {
      const topic = this.topics[i];
      if (topic.slug === slug) {
        if (this.currentDiscussionSlug) {
          topic.setInitialDiscussionSlug(this.currentDiscussionSlug);
          topic.currentDiscussionSlug = this.currentDiscussionSlug;
        }

        topic.loadInitialDiscussions();
        this.currentTopic = topic;
        break;
      }
    }
  }

  @action
  async loadTopics() {
    if (this.isLoadingTopics) {
      return;
    }

    this.isLoadingTopics = true;

    try {
      const { topics = [] } = await getTopicList(this._id);
      const topicObjs = topics.map(t => new Topic({ team: this, ...t }));

      runInAction(() => {
        this.topics.replace(topicObjs);

        if (!this.currentTopicSlug && topics.length > 0) {
          this.currentTopicSlug = topicObjs[0].slug;
        }

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
  async addTopic(data) {
    const { topic } = await addTopic({ teamId: this._id, ...data });
    const topicObj = new Topic({ team: this, ...topic });

    runInAction(() => {
      this.topics.unshift(topicObj);
    });
  }

  @action
  async deleteTopic(topicId: string) {
    const topic = this.topics.find(t => t._id === topicId);

    await deleteTopic(topicId);
    runInAction(() => {
      this.topics.remove(topic);
    });
  }

  @action
  async loadMembers() {
    if (this.isLoadingMembers) {
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
