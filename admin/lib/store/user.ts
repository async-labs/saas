import { observable, decorate  } from 'mobx';

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
}

decorate(User, {
  slug: observable,
  email: observable,
  displayName: observable,
  avatarUrl: observable,
  defaultTeamSlug: observable,

});

export { User };
