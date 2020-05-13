import { action, decorate, observable, runInAction } from 'mobx';

import { toggleThemeApiMethod, updateProfileApiMethod } from '../api/team-member';
import { Store } from './index';

class User {
  public store: Store;

  public _id: string;
  public isAdmin: boolean;
  public slug: string;
  public email: string | null;
  public displayName: string | null;
  public avatarUrl: string | null;
  public defaultTeamSlug: string;
  public isSignedupViaGoogle: boolean;

  public hasCardInformation: boolean;
  public stripeCard: {
    brand: string;
    funding: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  public stripeListOfInvoices: {
    object: string;
    data: [
      {
        amount_paid: number;
        teamName: string;
        date: number;
        hosted_invoice_url: string;
      },
    ];
    has_more: boolean;
  };

  public darkTheme = true;

  public isLoggedIn = false;

  constructor(params) {
    this.store = params.store;

    this._id = params._id;
    this.isAdmin = params.isAdmin;
    this.slug = params.slug;
    this.email = params.email;
    this.displayName = params.displayName;
    this.avatarUrl = params.avatarUrl;
    this.defaultTeamSlug = params.defaultTeamSlug;

    this.darkTheme = !!params.darkTheme;
    this.isLoggedIn = !!params.isLoggedIn;
    this.isSignedupViaGoogle = !!params.isSignedupViaGoogle;
  }

  public async updateProfile({ name, avatarUrl }: { name: string; avatarUrl: string }) {
    const { updatedUser } = await updateProfileApiMethod({
      name,
      avatarUrl,
    });

    runInAction(() => {
      this.displayName = updatedUser.displayName;
      this.avatarUrl = updatedUser.avatarUrl;
      this.slug = updatedUser.slug;
    });
  }

  public async toggleTheme(darkTheme: boolean) {
    this.darkTheme = darkTheme;
    await toggleThemeApiMethod({ darkTheme });
    window.location.reload();
  }

  public login() {
    this.isLoggedIn = true;
  }

  public logout() {
    this.isLoggedIn = false;
  }
}

decorate(User, {
  slug: observable,
  email: observable,
  displayName: observable,
  avatarUrl: observable,
  defaultTeamSlug: observable,

  isLoggedIn: observable,

  updateProfile: action,
  toggleTheme: action,
  login: action,
  logout: action,
});

export { User };
