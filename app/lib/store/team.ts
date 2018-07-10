import { action, computed, decorate, IObservableArray, observable, runInAction } from 'mobx';
import Router from 'next/router';

import {
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

  public members: Map<string, User> = new Map();
  public invitedUsers: Map<string, Invitation> = new Map();
  private isLoadingMembers = false;
  private isInitialMembersLoaded = false;

  public currentDiscussion?: Discussion;
  public currentDiscussionSlug?: string;
  public discussions: IObservableArray<Discussion> = observable([]);

  public isLoadingDiscussions = false;
  private initialDiscussionSlug: string = '';

  constructor(params) {
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.slug = params.slug;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.memberIds.replace(params.memberIds || []);
    this.currentDiscussionSlug = params.currentDiscussionSlug || null;

    this.store = params.store;

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers, params.initialInvitations);
    }

    if (params.initialDiscussions) {
      this.setInitialDiscussions(params.initialDiscussions);
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
      const { discussions = [] } = await getDiscussionList({ teamId: this._id });

      runInAction(() => {
        discussions.forEach(t =>
          this.discussions.push(new Discussion({ team: this, store: this.store, ...t })),
        );
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
            `/team/${this.slug}/d/${d.slug}`,
          );
        } else {
          Router.push(`/discussion?teamSlug=${this.slug}`, `/team/${this.slug}/d`);
        }
      }
    });
  }

  public setInitialMembers(users, invitations) {
    this.members.clear();
    this.invitedUsers.clear();

    for (let i = 0; i < users.length; i++) {
      if (this.store.currentUser && this.store.currentUser._id === users[i]._id) {
        this.members.set(users[i]._id, this.store.currentUser);
      } else {
        this.members.set(users[i]._id, new User(users[i]));
      }
    }

    for (let i = 0; i < invitations.length; i++) {
      this.invitedUsers.set(invitations[i]._id, new Invitation(invitations[i]));
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
        for (let i = 0; i < users.length; i++) {
          this.members.set(users[i]._id, new User(users[i]));
        }
        for (let i = 0; i < invitations.length; i++) {
          this.invitedUsers.set(invitations[i]._id, new Invitation(invitations[i]));
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

  edit: action,
  setInitialMembers: action,
  loadInitialMembers: action,
  inviteMember: action,
  removeMember: action,

  currentDiscussion: observable,
  currentDiscussionSlug: observable,
  isLoadingDiscussions: observable,
  discussions: observable,

  setInitialDiscussions: action,
  setCurrentDiscussion: action,
  setInitialDiscussionSlug: action,
  loadDiscussions: action,
  addDiscussionToLocalCache: action,
  editDiscussionFromLocalCache: action,
  removeDiscussionFromLocalCache: action,
  addDiscussion: action,
  deleteDiscussion: action,

  orderedDiscussions: computed,
});

export { Team };
