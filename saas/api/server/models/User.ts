/* eslint-disable @typescript-eslint/camelcase */

import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import Stripe from 'stripe';

import sendEmail from '../aws-ses';
import { addToMailchimp } from '../mailchimp';
import { generateSlug } from '../utils/slugify';
import getEmailTemplate from './EmailTemplate';
import Team, { TeamDocument } from './Team';

import { getListOfInvoices } from '../stripe';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
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
  displayName: String,
  avatarUrl: String,
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
  darkTheme: Boolean,
  defaultTeamSlug: {
    type: String,
    default: '',
  },
  stripeCustomer: {
    id: String,
    object: String,
    created: Number,
    currency: String,
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
    exp_month: Number,
    exp_year: Number,
  },
  hasCardInformation: {
    type: Boolean,
    default: false,
  },
  stripeListOfInvoices: {
    object: String,
    has_more: Boolean,
    data: [
      {
        id: String,
        object: String,
        amount_paid: Number,
        created: Number,
        customer: String,
        subscription: String,
        hosted_invoice_url: String,
        billing: String,
        paid: Boolean,
        number: String,
        teamId: String,
        teamName: String,
      },
    ],
  },
});

export interface UserDocument extends mongoose.Document {
  slug: string;
  createdAt: Date;
  email: string;
  displayName: string;
  avatarUrl: string;
  googleId: string;
  googleToken: { accessToken: string; refreshToken: string };
  isSignedupViaGoogle: boolean;
  darkTheme: boolean;
  defaultTeamSlug: string;
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
  hasCardInformation: boolean;
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
}

interface UserModel extends mongoose.Model<UserDocument> {
  getUserBySlug({ slug }: { slug: string }): Promise<UserDocument>;

  updateProfile({
    userId,
    name,
    avatarUrl,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<UserDocument[]>;

  publicFields(): string[];

  signInOrSignUpViaGoogle({
    googleId,
    email,
    displayName,
    avatarUrl,
    googleToken,
  }: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl: string;
    googleToken: { accessToken?: string; refreshToken?: string };
  }): Promise<UserDocument>;

  signInOrSignUpByPasswordless({
    uid,
    email,
  }: {
    uid: string;
    email: string;
  }): Promise<UserDocument>;

  toggleTheme({ userId, darkTheme }: { userId: string; darkTheme: boolean }): Promise<void>;

  getMembersForTeam({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<UserDocument[]>;

  checkPermissionAndGetTeam({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<TeamDocument>;

  saveStripeCustomerAndCard({
    user,
    session,
  }: {
    session: Stripe.Checkout.Session;
    user: UserDocument;
  }): Promise<void>;

  changeStripeCard({
    session,
    user,
  }: {
    session: Stripe.Checkout.Session;
    user: UserDocument;
  }): Promise<void>;

  getListOfInvoicesForCustomer({ userId }: { userId: string }): Promise<UserDocument>;
}

class UserClass extends mongoose.Model {
  public static async getUserBySlug({ slug }) {
    console.log('Static method: getUserBySlug');

    return this.findOne({ slug }, 'email displayName avatarUrl').lean();
  }

  public static async updateProfile({ userId, name, avatarUrl }) {
    console.log('Static method: updateProfile');

    const user = await this.findById(userId, 'slug displayName');

    const modifier = { displayName: user.displayName, avatarUrl, slug: user.slug };

    console.log(user.slug);

    if (name !== user.displayName) {
      modifier.displayName = name;
      modifier.slug = await generateSlug(this, name);
    }

    return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
      .select('displayName avatarUrl slug')
      .lean();
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
      'darkTheme',
      'defaultTeamSlug',
      'stripeCard',
      'hasCardInformation',
      'stripeListOfInvoices',
    ];
  }

  public static async signInOrSignUpViaGoogle({
    googleId,
    email,
    displayName,
    avatarUrl,
    googleToken,
  }) {
    const user = await this.findOne({ email })
      .select([...this.publicFields(), 'googleId'].join(' '))
      .lean();

    if (user) {
      if (_.isEmpty(googleToken) && user.googleId) {
        return user;
      }

      const modifier = { googleId };
      if (googleToken.accessToken) {
        modifier['googleToken.accessToken'] = googleToken.accessToken;
      }

      if (googleToken.refreshToken) {
        modifier['googleToken.refreshToken'] = googleToken.refreshToken;
      }

      await this.updateOne({ email }, { $set: modifier });

      return user;
    }

    const slug = await generateSlug(this, displayName);

    const newUser = await this.create({
      createdAt: new Date(),
      googleId,
      email,
      googleToken,
      displayName,
      avatarUrl,
      slug,
      isSignedupViaGoogle: true,
      defaultTeamSlug: '',
    });

    const emailTemplate = await getEmailTemplate('welcome', { userName: displayName });

    if (!emailTemplate) {
      throw new Error('Welcome email template not found');
    }

    try {
      await sendEmail({
        from: `Kelly from saas-app.builderbook.org <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: emailTemplate.subject,
        body: emailTemplate.message,
      });
    } catch (err) {
      console.error('Email sending error:', err);
    }

    try {
      await addToMailchimp({ email, listName: 'signups' });
    } catch (error) {
      console.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
  }

  public static async signInOrSignUpByPasswordless({ uid, email }) {
    const user = await this.findOne({ email }).select(this.publicFields().join(' ')).lean();

    if (user) {
      throw Error('User already exists');
    }

    const slug = await generateSlug(this, email);

    const newUser = await this.create({
      _id: uid,
      createdAt: new Date(),
      email,
      slug,
      defaultTeamSlug: '',
    });

    const emailTemplate = await getEmailTemplate('welcome', { userName: email });

    if (!emailTemplate) {
      throw new Error('Email template "welcome" not found in database.');
    }

    try {
      await sendEmail({
        from: `Kelly from saas-app.builderbook.org <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: emailTemplate.subject,
        body: emailTemplate.message,
      });
    } catch (err) {
      console.error('Email sending error:', err);
    }

    try {
      await addToMailchimp({ email, listName: 'signups' });
    } catch (error) {
      console.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
  }

  public static toggleTheme({ userId, darkTheme }) {
    return this.updateOne({ _id: userId }, { darkTheme: !!darkTheme });
  }

  public static async getMembersForTeam({ userId, teamId }) {
    const team = await this.checkPermissionAndGetTeam({ userId, teamId });

    return this.find({ _id: { $in: team.memberIds } })
      .select(this.publicFields().join(' '))
      .lean();
  }

  public static async saveStripeCustomerAndCard({
    user,
    session,
  }: {
    session: Stripe.Checkout.Session;
    user: UserDocument;
  }) {
    if (!user) {
      throw new Error('User not found.');
    }

    const stripeSubscription = session.subscription as Stripe.Subscription;

    const stripeCard =
      (stripeSubscription.default_payment_method &&
        (stripeSubscription.default_payment_method as Stripe.PaymentMethod).card) ||
      undefined;

    const hasCardInformation = !!stripeCard;

    await this.updateOne(
      { _id: user._id },
      {
        stripeCustomer: session.customer,
        stripeCard,
        hasCardInformation,
      },
    );
  }

  public static async changeStripeCard({
    session,
    user,
  }: {
    session: Stripe.Checkout.Session;
    user: UserDocument;
  }): Promise<void> {
    if (!user) {
      throw new Error('User not found.');
    }

    const si: Stripe.SetupIntent = session.setup_intent as Stripe.SetupIntent;
    const pm: Stripe.PaymentMethod = si.payment_method as Stripe.PaymentMethod;

    if (!pm.card) {
      throw new Error('No card found.');
    }
    await this.updateOne({ _id: user._id }, { stripeCard: pm.card, hasCardInformation: true });
  }

  public static async getListOfInvoicesForCustomer({ userId }) {
    const user = await this.findById(userId, 'stripeCustomer');

    if (!user.stripeCustomer.id) {
      throw new Error('You are not a customer and you have no payment history.');
    }

    const newListOfInvoices = await getListOfInvoices({
      customerId: user.stripeCustomer.id,
    });

    if (newListOfInvoices.data === undefined || newListOfInvoices.data.length === 0) {
      throw new Error('You are a customer. But there is no payment history.');
    }

    const modifier = {
      stripeListOfInvoices: newListOfInvoices,
    };

    return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
      .select('stripeListOfInvoices')
      .lean();
  }

  private static async checkPermissionAndGetTeam({ userId, teamId }) {
    console.log(userId, teamId);

    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId).select('memberIds').lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return team;
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<UserDocument, UserModel>('User', mongoSchema);

export default User;
