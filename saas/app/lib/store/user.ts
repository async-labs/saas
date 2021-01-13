import { action, decorate, observable, runInAction } from 'mobx';

import { getListOfInvoicesApiMethod } from '../api/team-leader';
import { toggleThemeApiMethod, updateProfileApiMethod } from '../api/team-member';
import { Store } from './index';

class User {
  public store: Store;

  public _id: string;
  public slug: string;
  public email: string | null;
  public displayName: string | null;
  public avatarUrl: string | null;
  public isSignedupViaGoogle: boolean;

  public darkTheme = false;
  public defaultTeamSlug: string;

  public stripeCard: {
    brand: string;
    funding: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  public hasCardInformation: boolean;
  public stripeListOfInvoices: {
    object: string;
    data: [
      {
        amount_paid: number;
        teamName: string;
        created: number;
        hosted_invoice_url: string;
      },
    ];
    has_more: boolean;
  };

  constructor(params) {
    this.store = params.store;
    this._id = params._id;
    this.slug = params.slug;
    this.email = params.email;
    this.displayName = params.displayName;
    this.avatarUrl = params.avatarUrl;
    this.isSignedupViaGoogle = !!params.isSignedupViaGoogle;
    this.darkTheme = !!params.darkTheme;
    this.defaultTeamSlug = params.defaultTeamSlug;

    this.stripeCard = params.stripeCard;
    this.hasCardInformation = params.hasCardInformation;
    this.stripeListOfInvoices = params.stripeListOfInvoices;
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
    await toggleThemeApiMethod({ darkTheme });
    runInAction(() => {
      this.darkTheme = darkTheme;
    });
    window.location.reload();
  }

  public async getListOfInvoices() {
    try {
      const { stripeListOfInvoices } = await getListOfInvoicesApiMethod();
      runInAction(() => {
        this.stripeListOfInvoices = stripeListOfInvoices;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

decorate(User, {
  slug: observable,
  email: observable,
  displayName: observable,
  avatarUrl: observable,
  darkTheme: observable,
  defaultTeamSlug: observable,
  stripeCard: observable,
  stripeListOfInvoices: observable,

  updateProfile: action,
  toggleTheme: action,
  getListOfInvoices: action,
});

export { User };
