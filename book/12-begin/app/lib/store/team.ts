import { action, computed, decorate, IObservableArray, observable, runInAction } from 'mobx';
import Router from 'next/router';

import {
  cancelSubscriptionApiMethod,
  createSubscriptionApiMethod,
  getTeamInvitedUsers,
  getTeamMembers,
  inviteMember,
  removeMember,
  updateTeam,
} from '../api/team-leader';

import { addDiscussion, deleteDiscussion, getDiscussionList } from '../api/team-member';

import { Discussion } from './discussion';
import { Store } from './index';
import { Invitation } from './invitation';
import { User } from './user';

class Team {
  public store: Store;

  public _id: string;
  public teamLeaderId: string;

  public name: string;
  public slug: string;
  public avatarUrl: string;
  public memberIds: IObservableArray<string> = observable([]);

  public isSubscriptionActive: boolean;
  public isPaymentFailed: boolean;

  public members: Map<string, User> = new Map();
  public invitedUsers: Map<string, Invitation> = new Map();

  public currentDiscussion?: Discussion;
  public currentDiscussionSlug?: string;
  public discussions: IObservableArray<Discussion> = observable([]);
  public isLoadingDiscussions = false;
  public discussion: Discussion;

  public stripeSubscription: {
    id: string;
    object: string;
    application_fee_percent: number;
    billing: string;
    cancel_at_period_end: boolean;
    billing_cycle_anchor: number;
    canceled_at: number;
    created: number;
  };

  public isLoadingMembers = false;
  public isInitialMembersLoaded = false;
  public initialDiscussionSlug: string = '';

  constructor(params) {
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.slug = params.slug;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.memberIds.replace(params.memberIds || []);
    this.currentDiscussionSlug = params.currentDiscussionSlug || null;

    this.isSubscriptionActive = params.isSubscriptionActive;
    this.stripeSubscription = params.stripeSubscription;
    this.isPaymentFailed = params.isPaymentFailed;

    this.store = params.store;

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers, params.initialInvitations);
    }

    if (params.initialDiscussions) {
      this.setInitialDiscussions(params.initialDiscussions);
    } else {
      this.loadDiscussions();
    }
  }

  public async edit({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    try {
      const { slug } = await updateTeam({
        teamId: this._id,
        name,
        avatarUrl,
      });

      runInAction(() => {
        this.name = name;
        this.slug = slug;
        this.avatarUrl = avatarUrl;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public setCurrentDiscussion({ slug }: { slug: string }) {
    this.currentDiscussionSlug = slug;
    for (const discussion of this.discussions) {
      if (discussion && discussion.slug === slug) {
        this.currentDiscussion = discussion;
        break;
      }
    }
  }

  public getDiscussionBySlug(slug): Discussion {
    return this.discussions.find(d => d.slug === slug);
  }

  public setInitialDiscussionSlug(slug: string) {
    if (!this.initialDiscussionSlug) {
      this.initialDiscussionSlug = slug;
    }
  }

  public setInitialDiscussions(discussions) {
    const discussionObjs = discussions.map(
      t => new Discussion({ team: this, store: this.store, ...t }),
    );

    this.discussions.replace(discussionObjs);

    if (!this.currentDiscussionSlug && this.discussions.length > 0) {
      this.currentDiscussionSlug = this.orderedDiscussions[0].slug;
    }

    if (this.currentDiscussionSlug) {
      this.setCurrentDiscussion({ slug: this.currentDiscussionSlug });
    }
  }

  public async loadDiscussions() {
    if (this.store.isServer || this.isLoadingDiscussions) {
      return;
    }

    this.isLoadingDiscussions = true;

    try {
      const { discussions = [] } = await getDiscussionList({
        teamId: this._id,
      });
      const newList: Discussion[] = [];

      runInAction(() => {
        discussions.forEach(d => {
          const disObj = this.discussions.find(obj => obj._id === d._id);
          if (disObj) {
            disObj.changeLocalCache(d);
            newList.push(disObj);
          } else {
            newList.push(new Discussion({ team: this, store: this.store, ...d }));
          }
        });

        this.discussions.replace(newList);
      });
    } finally {
      runInAction(() => {
        this.isLoadingDiscussions = false;
      });
    }
  }

  public addDiscussionToLocalCache(data): Discussion {
    const obj = new Discussion({ team: this, store: this.store, ...data });

    if (obj.memberIds.includes(this.store.currentUser._id)) {
      this.discussions.push(obj);
    }

    return obj;
  }

  public editDiscussionFromLocalCache(data) {
    const discussion = this.discussions.find(item => item._id === data.id);
    if (discussion) {
      discussion.changeLocalCache(data);
    }
  }

  public removeDiscussionFromLocalCache(discussionId: string) {
    const discussion = this.discussions.find(item => item._id === discussionId);
    this.discussions.remove(discussion);
  }

  public async addDiscussion(data): Promise<Discussion> {
    const { discussion } = await addDiscussion({
      teamId: this._id,
      // 13
      // socketId: (this.store.socket && this.store.socket.id) || null,
      ...data,
    });

    return new Promise<Discussion>(resolve => {
      runInAction(() => {
        const obj = this.addDiscussionToLocalCache(discussion);
        resolve(obj);
      });
    });
  }

  public async deleteDiscussion(id: string) {
    await deleteDiscussion({
      id,
      // 13
      // socketId: (this.store.socket && this.store.socket.id) || null,
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
            `/discussion?teamSlug=${this.slug}&discussionSlug=${d.slug}`,
            `/team/${this.slug}/discussions/${d.slug}`,
          );
        } else {
          Router.push(`/discussion?teamSlug=${this.slug}`, `/team/${this.slug}/discussions`);
        }
      }
    });
  }

  public setInitialMembers(users, invitations) {
    this.members.clear();
    this.invitedUsers.clear();

    for (const user of users) {
      if (this.store.currentUser && this.store.currentUser._id === user._id) {
        this.members.set(user._id, this.store.currentUser);
      } else {
        this.members.set(user._id, new User(user));
      }
    }

    for (const invitation of invitations) {
      this.invitedUsers.set(invitation._id, new Invitation(invitation));
    }

    this.isInitialMembersLoaded = true;
  }

  public async loadInitialMembers() {
    if (this.isLoadingMembers || this.isInitialMembersLoaded) {
      return;
    }

    this.isLoadingMembers = true;

    try {
      const { users = [] } = await getTeamMembers(this._id);

      let invitations = [];
      if (this.store.currentUser._id === this.teamLeaderId) {
        invitations = await getTeamInvitedUsers(this._id);
      }

      runInAction(() => {
        for (const user of users) {
          this.members.set(user._id, new User(user));
        }
        for (const invitation of invitations) {
          this.invitedUsers.set(invitation._id, new Invitation(invitation));
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

  public async inviteMember({ email }: { email: string }) {
    this.isLoadingMembers = true;
    try {
      const { newInvitation } = await inviteMember({ teamId: this._id, email });

      runInAction(() => {
        this.invitedUsers.set(newInvitation._id, new Invitation(newInvitation));
        this.isLoadingMembers = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoadingMembers = false;
      });

      throw error;
    }
  }

  public async removeMember(userId: string) {
    await removeMember({ teamId: this._id, userId });

    runInAction(() => {
      this.members.delete(userId);
    });
  }

  get orderedDiscussions() {
    return this.discussions.slice().sort();
  }

  public async createSubscription({ teamId }: { teamId: string }) {
    try {
      const { isSubscriptionActive, stripeSubscription } = await createSubscriptionApiMethod({
        teamId,
      });

      runInAction(() => {
        this.isSubscriptionActive = isSubscriptionActive;
        this.stripeSubscription = stripeSubscription;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async cancelSubscription({ teamId }: { teamId: string }) {
    try {
      const { isSubscriptionActive } = await cancelSubscriptionApiMethod({ teamId });

      runInAction(() => {
        this.isSubscriptionActive = isSubscriptionActive;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async checkIfTeamLeaderMustBeCustomer() {
    let ifTeamLeaderMustBeCustomerOnClient: boolean;

    if (this && this.memberIds.length < 2) {
      ifTeamLeaderMustBeCustomerOnClient = false;
    } else if (this && this.memberIds.length >= 2 && this.isSubscriptionActive) {
      ifTeamLeaderMustBeCustomerOnClient = false;
    } else if (this && this.memberIds.length >= 2 && !this.isSubscriptionActive) {
      ifTeamLeaderMustBeCustomerOnClient = true;
    }

    return ifTeamLeaderMustBeCustomerOnClient;
  }

  // 13
  // public leaveSocketRoom() {
  //   if (this.store.socket) {
  //     console.log('leaving socket team room', this.name);
  //     this.store.socket.emit('leaveTeam', this._id);

  //     if (this.discussion) {
  //       this.discussion.leaveSocketRoom();
  //     }
  //   }
  // }

  // 13
  // public joinSocketRoom() {
  //   if (this.store.socket) {
  //     console.log('joining socket team room', this.name);
  //     this.store.socket.emit('joinTeam', this._id);

  //     if (this.discussion) {
  //       this.discussion.joinSocketRoom();
  //     }
  //   }
  // }

  public changeLocalCache(data) {
    this.name = data.name;
    this.memberIds.replace(data.memberIds || []);
  }
}

decorate(Team, {
  name: observable,
  slug: observable,
  avatarUrl: observable,
  memberIds: observable,
  members: observable,
  invitedUsers: observable,
  isLoadingMembers: observable,
  isInitialMembersLoaded: observable,
  isSubscriptionActive: observable,
  stripeSubscription: observable,
  isPaymentFailed: observable,
  currentDiscussion: observable,
  currentDiscussionSlug: observable,
  isLoadingDiscussions: observable,
  discussions: observable,

  orderedDiscussions: computed,

  edit: action,
  setInitialMembers: action,
  loadInitialMembers: action,
  inviteMember: action,
  removeMember: action,
  setInitialDiscussions: action,
  setCurrentDiscussion: action,
  setInitialDiscussionSlug: action,
  loadDiscussions: action,
  addDiscussionToLocalCache: action,
  editDiscussionFromLocalCache: action,
  removeDiscussionFromLocalCache: action,
  addDiscussion: action,
  deleteDiscussion: action,
});

export { Team };
