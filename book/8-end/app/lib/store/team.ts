import { action, computed, decorate, IObservableArray, observable, runInAction } from 'mobx';
// import Router from 'next/router';
import { inviteMemberApiMethod, removeMemberApiMethod, updateTeamApiMethod } from '../api/team-leader';
import { addDiscussionApiMethod, deleteDiscussionApiMethod, getDiscussionListApiMethod } from '../api/team-member';
import { Store } from './index';
import { User } from './user';
import { Invitation } from './invitation';
import { Discussion } from './discussion';

class Team {
  public store: Store;

  public _id: string;
  public teamLeaderId: string;

  public name: string;
  public slug: string;
  public avatarUrl: string;
  public memberIds: IObservableArray<string> = observable([]);
  public members: Map<string, User> = new Map();
  public invitations: Map<string, Invitation> = new Map();

  public currentDiscussion?: Discussion;
  public currentDiscussionSlug?: string;
  public discussions: IObservableArray<Discussion> = observable([]);
  public isLoadingDiscussions = false;

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
      this.setInitialMembersAndInvitations(params.initialMembers, params.initialInvitations);
    }

    if (params.initialDiscussions) {
      this.setInitialDiscussions(params.initialDiscussions);
    } else {
      this.loadDiscussions();
    }
  }

  public setInitialMembersAndInvitations(users, invitations) {
    this.members.clear();
    this.invitations.clear();

    for (const user of users) {
      if (this.store.currentUser && this.store.currentUser._id === user._id) {
        this.members.set(user._id, this.store.currentUser);
      } else {
        this.members.set(user._id, new User(user));
      }
    }

    for (const invitation of invitations) {
      this.invitations.set(invitation._id, new Invitation(invitation));
    }

    // console.log(this.members);
  }

  public async updateTheme({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    try {
      const { slug } = await updateTeamApiMethod({
        teamId: this._id,
        name,
        avatarUrl,
      });

      runInAction(() => {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.slug = slug;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async inviteMember(email: string) {
    try {
      const { newInvitation } = await inviteMemberApiMethod({ teamId: this._id, email });

      runInAction(() => {
        this.invitations.set(newInvitation._id, new Invitation(newInvitation));
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async removeMember(userId: string) {
    try {
      await removeMemberApiMethod({ teamId: this._id, userId });

      runInAction(() => {
        this.members.delete(userId);
        this.memberIds.remove(userId);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public setInitialDiscussions(discussions) {
    const discussionObjs = discussions.map(
      (d) => new Discussion({ team: this, store: this.store, ...d }),
    );

    console.log(discussions);

    this.discussions.replace(discussionObjs);

    if (!this.currentDiscussionSlug && this.discussions.length > 0) {
      this.currentDiscussionSlug = this.orderedDiscussions[0].slug;
    }
  }

  public async loadDiscussions() {
    if (this.store.isServer || this.isLoadingDiscussions) {
      return;
    }

    this.isLoadingDiscussions = true;

    try {
      const { discussions = [] } = await getDiscussionListApiMethod({
        teamId: this._id,
      });
      const newList: Discussion[] = [];

      runInAction(() => {
        discussions.forEach((d) => {
          const disObj = this.discussions.find((obj) => obj._id === d._id);
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

  public changeLocalCache(data) {
    this.name = data.name;
    this.memberIds.replace(data.memberIds || []);
  }

  // public editDiscussionFromLocalCache(data) {
  //   const discussion = this.discussions.find((item) => item._id === data.id);
  //   if (discussion) {
  //     discussion.changeLocalCache(data);
  //   }
  // }

  public async addDiscussion(data): Promise<Discussion> {
    const { discussion } = await addDiscussionApiMethod({
      teamId: this._id,
      socketId: (this.store.socket && this.store.socket.id) || null,
      ...data,
    });

    return new Promise<Discussion>((resolve) => {
      runInAction(() => {
        const obj = this.addDiscussionToLocalCache(discussion);
        resolve(obj);
      });
    });
  }

  public addDiscussionToLocalCache(data): Discussion {
    const obj = new Discussion({ team: this, store: this.store, ...data });

    if (obj.memberIds.includes(this.store.currentUser._id)) {
      this.discussions.push(obj);
    }

    return obj;
  }

  public async deleteDiscussion(id: string) {
    await deleteDiscussionApiMethod({
      id,
      socketId: (this.store.socket && this.store.socket.id) || null,
    });

    runInAction(() => {
      this.deleteDiscussionFromLocalCache(id);

      // const discussion = this.discussions.find((d) => d._id === id);

      // if (this.currentDiscussion === discussion) {
      //   this.currentDiscussion = null;
      //   this.currentDiscussionSlug = null;

      //   if (this.discussions.length > 0) {
      //     const d = this.discussions[0];

      //     Router.push(
      //       `/discussion?teamSlug=${this.slug}&discussionSlug=${d.slug}`,
      //       `/team/${this.slug}/discussions/${d.slug}`,
      //     );
      //   } else {
      //     Router.push(`/discussion?teamSlug=${this.slug}`, `/team/${this.slug}/discussions`);
      //   }
      // }
    });
  }

  public deleteDiscussionFromLocalCache(discussionId: string) {
    const discussion = this.discussions.find((item) => item._id === discussionId);
    this.discussions.remove(discussion);
  }

  public getDiscussionBySlug(slug): Discussion {
    return this.discussions.find((d) => d.slug === slug);
  }

  get orderedDiscussions() {
    return [].slice().sort();
  }
}

decorate(Team, {
  name: observable,
  slug: observable,
  avatarUrl: observable,
  memberIds: observable,
  members: observable,
  invitations: observable,
  currentDiscussion: observable,
  currentDiscussionSlug: observable,
  isLoadingDiscussions: observable,
  discussions: observable,

  setInitialMembersAndInvitations: action,
  updateTheme: action,
  inviteMember: action,
  removeMember: action,
  setInitialDiscussions: action,
  loadDiscussions: action,
  addDiscussion: action,
  addDiscussionToLocalCache: action,
  deleteDiscussion: action,
  deleteDiscussionFromLocalCache: action,
  getDiscussionBySlug: action,

  orderedDiscussions: computed,
});

export { Team };
