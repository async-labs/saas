import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import {
  getTeamInvitedUsersApiMethod,
  getTeamMembersApiMethod,
  inviteMemberApiMethod,
  removeMemberApiMethod,
  updateTeamApiMethod,
} from '../api/team-leader';

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

  public isLoadingMembers = false;
  public isInitialMembersLoaded = false;
  public initialDiscussionSlug = '';

  constructor(params) {
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.slug = params.slug;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.memberIds.replace(params.memberIds || []);

    this.store = params.store;

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers, params.initialInvitations);
    }
  }

  public async edit({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    try {
      const { slug } = await updateTeamApiMethod({
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
      const { users = [] } = await getTeamMembersApiMethod(this._id);

      let invitations = [];
      if (this.store.currentUser._id === this.teamLeaderId) {
        invitations = await getTeamInvitedUsersApiMethod(this._id);
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
      const { newInvitation } = await inviteMemberApiMethod({ teamId: this._id, email });

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
    await removeMemberApiMethod({ teamId: this._id, userId });

    runInAction(() => {
      this.members.delete(userId);
    });
  }

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

  edit: action,
  setInitialMembers: action,
  loadInitialMembers: action,
  inviteMember: action,
  removeMember: action,
});

export { Team };
