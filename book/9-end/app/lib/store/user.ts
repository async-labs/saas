import { action, decorate, observable, runInAction } from 'mobx';

// 11
// import {
//   createCustomerApiMethod,
//   createNewCardAndUpdateCustomerApiMethod,
//   getListOfInvoices,
// } from '../api/team-leader';

import { toggleTheme, updateProfile } from '../api/team-member';
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

  // 11
  // public hasCardInformation: boolean;
  // public stripeCard: {
  //   brand: string;
  //   funding: string;
  //   last4: string;
  //   exp_month: number;
  //   exp_year: number;
  // };
  // public stripeListOfInvoices: {
  //   object: string;
  //   data: [
  //     {
  //       amount_paid: number;
  //       teamName: string;
  //       date: number;
  //       hosted_invoice_url: string;
  //     }
  //   ];
  //   has_more: boolean;
  // };

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

    // 11
    // this.hasCardInformation = params.hasCardInformation;
    // this.stripeCard = params.stripeCard;
    // this.stripeListOfInvoices = params.stripeListOfInvoices;
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

  // 11
  // public async createCustomer({ token }: { token: object }) {
  //   try {
  //     const { hasCardInformation, stripeCard } = await createCustomerApiMethod({
  //       token,
  //     });

  //     runInAction(() => {
  //       this.hasCardInformation = hasCardInformation;
  //       this.stripeCard = stripeCard;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // public async createNewCardAndUpdateCustomer({ token }: { token: object }) {
  //   try {
  //     const { stripeCard } = await createNewCardAndUpdateCustomerApiMethod({
  //       token,
  //     });

  //     runInAction(() => {
  //       this.stripeCard = stripeCard;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // public async getListOfInvoices() {
  //   try {
  //     const { stripeListOfInvoices } = await getListOfInvoices();
  //     runInAction(() => {
  //       this.stripeListOfInvoices = stripeListOfInvoices;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  public async toggleTheme(darkTheme: boolean) {
    this.darkTheme = darkTheme;
    await toggleTheme({ darkTheme });
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

  // 11
  // hasCardInformation: observable,
  // stripeCard: observable,
  // stripeListOfInvoices: observable,

  updateProfile: action,
  toggleTheme: action,
  login: action,
  logout: action,
});

export { User };
