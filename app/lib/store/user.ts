import { observable, runInAction, action, decorate } from 'mobx';

import { updateProfile } from '../api/team-member';

class User {
  _id: string;
  isAdmin: boolean;
  slug: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  defaultTeamSlug: string;

  constructor(params) {
    Object.assign(this, params);
  }

  async updateProfile({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    const { updatedUser } = await updateProfile({
      name: name,
      avatarUrl: avatarUrl,
    });

    runInAction(() => {
      this.displayName = updatedUser.displayName;
      this.avatarUrl = updatedUser.avatarUrl;
      this.slug = updatedUser.slug;
    });
  }
}

decorate(User, {
  slug: observable,
  email: observable,
  displayName: observable,
  avatarUrl: observable,
  defaultTeamSlug: observable,

  updateProfile: action,
});

export { User };
