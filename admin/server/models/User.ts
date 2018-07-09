import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import generateSlug from '../utils/slugify';
import sendEmail from '../aws-ses';
import getEmailTemplate from './EmailTemplate';
import Team from './Team';
import Invitation from './Invitation';

const mongoSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  googleToken: {
    accessToken: String,
    refreshToken: String,
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

  isGithubConnected: {
    type: Boolean,
    default: false,
  },
  githubAccessToken: String,
});

export interface IUserDocument extends mongoose.Document {
  googleId: string;
  googleToken: { accessToken: string; refreshToken: string };
  slug: string;
  createdAt: Date;

  email: string;
  isAdmin: boolean;
  displayName: string;
  avatarUrl: string;

  defaultTeamSlug: string;

  isGithubConnected: boolean;
  githubAccessToken: string;
}

interface IUserModel extends mongoose.Model<IUserDocument> {
  publicFields(): string[];

  updateProfile({
    userId,
    name,
    avatarUrl,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<IUserDocument[]>;

  getTeamMembers({ userId, teamId }: { userId: string; teamId: string }): Promise<IUserDocument[]>;

  signInOrSignUp({
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
  }): Promise<IUserDocument>;
}

// mongoSchema.pre('save', function(next) {
//   if (!this.createdAt) this.createdAt = new Date();
//   next();
// });

class UserClass extends mongoose.Model {
  static publicFields(): string[] {
    return [
      '_id',
      'id',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'isAdmin',
      'isGithubConnected',
      'defaultTeamSlug',
    ];
  }

  static async checkPermissionAndGetTeam({ userId, teamId }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('memberIds')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return team;
  }

  static async updateProfile({ userId, name, avatarUrl }) {
    // TODO: If avatarUrl is changed and old is uploaded to our S3, delete it from S3

    const user = await this.findById(userId, 'slug displayName');

    const modifier = { displayName: user.displayName, avatarUrl, slug: user.slug };

    if (name !== user.displayName) {
      modifier.displayName = name;
      modifier.slug = await generateSlug(this, name);
    }

    return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
      .select('name avatarUrl')
      .lean();
  }

  static async getTeamMembers({ userId, teamId }) {
    const team = await this.checkPermissionAndGetTeam({ userId, teamId });

    return this.find({ _id: { $in: team.memberIds } })
      .select(this.publicFields().join(' '))
      .lean();
  }

  static async signInOrSignUp({ googleId, email, googleToken, displayName, avatarUrl }) {
    const user = await this.findOne({ googleId })
      .select(this.publicFields().join(' '))
      .lean();

    if (user) {
      if (_.isEmpty(googleToken)) {
        return user;
      }

      const modifier = {};
      if (googleToken.accessToken) {
        modifier['googleToken.accessToken'] = googleToken.accessToken;
      }

      if (googleToken.refreshToken) {
        modifier['googleToken.refreshToken'] = googleToken.refreshToken;
      }

      await this.updateOne({ googleId }, { $set: modifier });

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
    });

    const template = await getEmailTemplate('welcome', {
      userName: displayName,
    });

    if ((await Invitation.find({ email: email }).count()) === 0) {
      try {
        await sendEmail({
          from: `Kelly from async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
          to: [email],
          subject: template.subject,
          body: template.message,
        });
      } catch (err) {
        console.error('Email sending error:', err);
      }
    }

    return _.pick(newUser, this.publicFields());
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<IUserDocument, IUserModel>('User', mongoSchema);

export default User;
