import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';

import logger from '../logs';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleToken: {
    accessToken: String,
    refreshToken: String,
  },
  isSignedupViaGoogle: {
    type: Boolean,
    required: true,
    default: false,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  defaultTeamSlug: {
    type: String,
    default: '',
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  displayName: String,
  avatarUrl: String,

  stripeCustomer: {
    id: String,
    object: String,
    created: Number,
    currency: String,
    // eslint-disable-next-line
    default_source: String,
    description: String,
  },
  stripeCard: {
    id: String,
    object: String,
    brand: String,
    funding: String,
    country: String,
    last4: String,
    // eslint-disable-next-line
    exp_month: Number,
    // eslint-disable-next-line
    exp_year: Number,
  },
  hasCardInformation: {
    type: Boolean,
    default: false,
  },
  stripeListOfInvoices: {
    object: String,
    // eslint-disable-next-line
    has_more: Boolean,
    data: [
      {
        id: String,
        object: String,
        // eslint-disable-next-line
        amount_paid: Number,
        date: Number,
        customer: String,
        subscription: String,
        // eslint-disable-next-line
        hosted_invoice_url: String,
        billing: String,
        paid: Boolean,
        number: String,
        teamId: String,
        teamName: String,
      },
    ],
  },
  darkTheme: Boolean,
});

export interface UserDocument extends mongoose.Document {
  googleId: string;
  googleToken: { accessToken: string; refreshToken: string };
  slug: string;
  createdAt: Date;

  email: string;
  isAdmin: boolean;
  displayName: string;
  avatarUrl: string;

  defaultTeamSlug: string;

  hasCardInformation: boolean;
  stripeCustomer: {
    id: string;
    default_source: string;
    created: number;
    object: string;
    description: string;
  };
  stripeCard: {
    id: string;
    object: string;
    brand: string;
    country: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  stripeListOfInvoices: {
    object: string;
    has_more: boolean;
    data: [
      {
        id: string;
        object: string;
        amount_paid: number;
        date: number;
        customer: string;
        subscription: string;
        hosted_invoice_url: string;
        billing: string;
        paid: boolean;
        number: string;
        teamId: string;
        teamName: string;
      },
    ];
  };
  darkTheme: boolean;
}

interface UserModel extends mongoose.Model<UserDocument> {
  publicFields(): string[];

  updateProfile({
    userId,
    name,
    avatarUrl,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<UserDocument[]>;

  toggleTheme({ userId, darkTheme }: { userId: string; darkTheme: boolean }): Promise<void>;
}

class UserClass extends mongoose.Model {
  public static async updateProfile({ userId, name, avatarUrl }) {
    // TODO: If avatarUrl is changed and old is uploaded to our S3, delete it from S3

    const user = await this.findById(userId, 'slug displayName');

    const modifier = { displayName: user.displayName, avatarUrl, slug: user.slug };

    if (name !== user.displayName) {
      modifier.displayName = name;
      modifier.slug = await generateSlug(this, name);
    }

    return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
      .select('displayName avatarUrl slug')
      .setOptions({ lean: true });
  }

  public static publicFields(): string[] {
    return [
      '_id',
      'id',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'isSignedupViaGoogle',
      'defaultTeamSlug',
      'hasCardInformation',
      'stripeCustomer',
      'stripeCard',
      'stripeListOfInvoices',
      'darkTheme',
    ];
  }

  public static toggleTheme({ userId, darkTheme }) {
    return this.updateOne({ _id: userId }, { darkTheme: !!darkTheme });
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<UserDocument, UserModel>('User', mongoSchema);
User.ensureIndexes((err) => {
  if (err) {
    logger.error(`User.ensureIndexes: ${err.stack}`);
  }
});

export default User;
