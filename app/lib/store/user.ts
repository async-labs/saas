import { action, decorate, observable, runInAction } from 'mobx';

import {
  createCustomerApiMethod,
  createNewCardAndUpdateCustomerApiMethod,
} from '../api/team-leader';
import { updateProfile } from '../api/team-member';
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

  public hasCardInformation: boolean;
  public stripeCard: {
    brand: string;
    funding: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };

  constructor(params) {
    this.store = params.store;

    this._id = params._id;
    this.isAdmin = params.isAdmin;
    this.slug = params.slug;
    this.email = params.email;
    this.displayName = params.displayName;
    this.avatarUrl = params.avatarUrl;
    this.defaultTeamSlug = params.defaultTeamSlug;

    this.hasCardInformation = params.hasCardInformation;
    this.stripeCard = params.stripeCard;
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

  public async createCustomer({ token }: { token: object }) {
    try {
      const { hasCardInformation, stripeCard } = await createCustomerApiMethod({
        token,
      });

      runInAction(() => {
        this.hasCardInformation = hasCardInformation;
        this.stripeCard = stripeCard;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async createNewCardAndUpdateCustomer({ token }: { token: object }) {
    try {
      const { stripeCard } = await createNewCardAndUpdateCustomerApiMethod({
        token,
      });

      runInAction(() => {
        this.stripeCard = stripeCard;
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
  defaultTeamSlug: observable,

  hasCardInformation: observable,
  stripeCard: observable,

  updateProfile: action,
});

export { User };
