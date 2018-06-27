import { observable  } from 'mobx';

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
}
