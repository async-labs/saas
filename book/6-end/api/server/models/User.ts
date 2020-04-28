import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import sendEmail from '../aws-ses';
import { subscribe } from '../mailchimp';
import { generateSlug } from '../utils/slugify';
import getEmailTemplate from './EmailTemplate';

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
});

// interface UserDocument extends mongoose.Document {
export interface UserDocument extends mongoose.Document {
  slug: string;
  createdAt: Date;
  email: string;
  displayName: string;
  avatarUrl: string;
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

  signUpByPasswordless({ uid, email }: { uid: string; email: string }): Promise<UserDocument>;
}

class UserClass extends mongoose.Model {
  public static async getUserBySlug({ slug }) {
    console.log('Static method: getUserBySlug');

    return this.findOne({ slug }, 'email displayName avatarUrl', { lean: true });
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
      .setOptions({ lean: true });
  }

  public static publicFields(): string[] {
    return ['_id', 'id', 'displayName', 'email', 'avatarUrl', 'slug', 'isSignedupViaGoogle'];
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
      isSignedupViaGoogle: true,
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
      await subscribe({ email, listName: 'signups' });
    } catch (error) {
      console.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
  }

  public static async signUpByPasswordless({ uid, email }) {
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
      await subscribe({ email, listName: 'signups' });
    } catch (error) {
      console.error('Mailchimp error:', error);
    }

    return _.pick(newUser, this.publicFields());
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<UserDocument, UserModel>('User', mongoSchema);

export default User;
