import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import { removeMemberApiMethod, updateTeamApiMethod } from '../api/team-leader';
  // getTeamInvitedUsersApiMethod,
  // inviteMemberApiMethod,
import { Store } from './index';
// import { Invitation } from './invitation';
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
  // public invitedUsers: Map<string, Invitation> = new Map();

  // public initialDiscussionSlug = '';

  constructor(params) {
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.slug = params.slug;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.memberIds.replace(params.memberIds || []);

    this.store = params.store;

    if (params.initialMembers) {
      this.setInitialMembers(params.initialMembers);
    }
    // if (params.initialMembers) {
    //   this.setInitialMembers(params.initialMembers, params.initialInvitations);
    // }
  }

  public async setInitialMembers(users) {
  // public setInitialMembers(users, invitations) {
    this.members.clear();
    // this.invitedUsers.clear();

    for (const user of users) {
      if (this.store.currentUser && this.store.currentUser._id === user._id) {
        this.members.set(user._id, this.store.currentUser);
      } else {
        this.members.set(user._id, new User(user));
      }
    }

    // for (const invitation of invitations) {
    //   this.invitedUsers.set(invitation._id, new Invitation(invitation));
    // }
  }

  // public async inviteMember({ email }: { email: string }) {
  //   this.isLoadingMembers = true;
  //   try {
  //     const { newInvitation } = await inviteMemberApiMethod({ teamId: this._id, email });

  //     runInAction(() => {
  //       this.invitedUsers.set(newInvitation._id, new Invitation(newInvitation));
  //       this.isLoadingMembers = false;
  //     });
  //   } catch (error) {
  //     runInAction(() => {
  //       this.isLoadingMembers = false;
  //     });

  //     throw error;
  //   }
  // }

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

  public async removeMember(userId: string) {
    try {
    await removeMemberApiMethod({ teamId: this._id, userId });

    runInAction(() => {
      this.members.delete(userId);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
  }
}

decorate(Team, {
  name: observable,
  slug: observable,
  avatarUrl: observable,
  memberIds: observable,
  members: observable,
  // invitedUsers: observable,

  setInitialMembers: action,
  // inviteMember: action,
  updateTheme: action,
  removeMember: action,
});

export { Team };
