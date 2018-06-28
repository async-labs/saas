import { observable, runInAction, action } from 'mobx';

import { updateProfile } from '../api/team-member';

export class User {
  _id: string;
  @observable slug: string;
  @observable email: string | null;
  @observable displayName: string | null;
  @observable avatarUrl: string | null;
  @observable defaultTeamSlug: string;

  constructor(params) {
    Object.assign(this, params);
  }

  @action
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
