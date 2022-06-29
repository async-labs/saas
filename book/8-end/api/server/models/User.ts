import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import sendEmail from '../aws-ses';
import { addToMailchimp } from '../mailchimp';
import { generateSlug } from '../utils/slugify';
import getEmailTemplate from './EmailTemplate';
import Team, { TeamDocument } from './Team';

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
}

class UserClass extends mongoose.Model {
  public static async getUserBySlug({ slug }) {
    console.log('Static method: getUserBySlug');

    return this.findOne({ slug }, 'email displayName avatarUrl').setOptions({ lean: true });
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
      defaultTeamSlug: '',
      darkTheme: false,
    });

    const emailTemplate = await getEmailTemplate('welcome', { userName: displayName });

    if (!emailTemplate) {
      throw new Error('Welcome email template not found');
    }

    try {
      await sendEmail({
        from: `Kelly from saas-app.async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
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

    const emailTemplate = await getEmailTemplate('welcome', { userName: email });

    if (!emailTemplate) {
      throw new Error('Email template "welcome" not found in database.');
    }

    try {
      await sendEmail({
        from: `Kelly from saas-app.async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
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
      .setOptions({ lean: true });
  }

  private static async checkPermissionAndGetTeam({ userId, teamId }) {
    console.log(userId, teamId);

    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId).select('memberIds').setOptions({ lean: true });

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return team;
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<UserDocument, UserModel>('User', mongoSchema);

export default User;
