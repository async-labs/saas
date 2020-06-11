import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import Stripe from 'stripe';

import sendEmail from '../aws-ses';
import logger from '../logs';
import { subscribe } from '../mailchimp';
import { generateSlug } from '../utils/slugify';
import getEmailTemplate, { EmailTemplate } from './EmailTemplate';
import Invitation from './Invitation';
import Team from './Team';

import { getListOfInvoices } from '../stripe';

import { EMAIL_SUPPORT_FROM_ADDRESS } from '../consts';

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
  isSignedupViaGoogle: boolean;
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

  getTeamMembers({ userId, teamId }: { userId: string; teamId: string }): Promise<UserDocument[]>;

  signInOrSignUpViaGoogle({
    googleId,
    email,
    googleToken,
    displayName,
    avatarUrl,
  }: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl: string;
    googleToken: { refreshToken?: string; accessToken?: string };
  }): Promise<UserDocument>;

  signUpByEmail({ uid, email }: { uid: string; email: string }): Promise<UserDocument>;
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

    logger.debug('called static method on User');

    logger.debug(user.stripeCustomer.id);

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
      .setOptions({ lean: true });
  }

  public static async getTeamMembers({ userId, teamId }) {
    const team = await this.checkPermissionAndGetTeam({ userId, teamId });

    return this.find({ _id: { $in: team.memberIds } })
      .select(this.publicFields().join(' '))
      .setOptions({ lean: true });
  }

  public static async signInOrSignUpViaGoogle({
    googleId,
    email,
    googleToken,
    displayName,
    avatarUrl,
  }) {
    const user = await this.findOne({ email })
      .select([...this.publicFields(), 'googleId'].join(' '))
      .setOptions({ lean: true });

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
      defaultTeamSlug: '',
      isSignedupViaGoogle: true,
    });

    const hasInvitation = (await Invitation.countDocuments({ email })) > 0;

    const emailTemplate = await EmailTemplate.findOne({ name: 'welcome' }).setOptions({
      lean: true,
    });

    if (!emailTemplate) {
      throw new Error('welcome Email template not found');
    }

    const template = await getEmailTemplate('welcome', { userName: displayName }, emailTemplate);

    if (!hasInvitation) {
      try {
        await sendEmail({
          from: `Kelly from saas-app.builderbook.org <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
          to: [email],
          subject: template.subject,
          body: template.message,
        });
      } catch (err) {
        logger.error('Email sending error:', err);
      }
    }

    try {
      await subscribe({ email, listName: 'signups' });
    } catch (error) {
      logger.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
  }

  public static async signUpByEmail({ uid, email }) {
    const user = await this.findOne({ email })
      .select(this.publicFields().join(' '))
      .setOptions({ lean: true });

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

    const hasInvitation = (await Invitation.countDocuments({ email })) > 0;

    const emailTemplate = await EmailTemplate.findOne({ name: 'welcome' }).setOptions({
      lean: true,
    });

    if (!emailTemplate) {
      throw new Error('welcome Email template not found');
    }

    const template = await getEmailTemplate('welcome', { userName: email }, emailTemplate);

    if (!hasInvitation) {
      try {
        await sendEmail({
          from: `Kelly from saas-app.builderbook.org <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
          to: [email],
          subject: template.subject,
          body: template.message,
        });
      } catch (err) {
        logger.error('Email sending error:', err);
      }
    }

    try {
      await subscribe({ email, listName: 'signups' });
    } catch (error) {
      logger.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
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

  public static async checkPermissionAndGetTeam({ userId, teamId }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('memberIds')
      .setOptions({ lean: true });

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return team;
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
