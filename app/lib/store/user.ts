import { action, decorate, observable, runInAction } from 'mobx';

import { updateProfile } from '../api/team-member';

class User {
  public _id: string;
  public isAdmin: boolean;
  public slug: string;
  public email: string | null;
  public displayName: string | null;
  public avatarUrl: string | null;
  public defaultTeamSlug: string;

  constructor(params) {
    Object.assign(this, params);
  }

  public async updateProfile({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    const { updatedUser } = await updateProfile({
      name,
      avatarUrl,
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
