import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import generateSlug from '../utils/slugify';
import sendEmail from '../aws';
import logger from '../logs';
import getEmailTemplate from './EmailTemplate';
import Team from './Team';

export interface IUserDocument extends mongoose.Document {
  googleId: string;
  googleToken: { accessToken: string; refreshToken: string };
  slug: string;
  createdAt: Date;

  email: string;
  isAdmin: boolean;
  displayName: string;
  avatarUrl: string;

  isGithubConnected: boolean;
  githubAccessToken: string;
}

interface IUserModel extends mongoose.Model<IUserDocument> {
  publicFields(): string[];
  search(query: string): Promise<IUserDocument[]>;

  getTeamMemberList({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<IUserDocument[]>;

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
  teamIds: [String],
  projectIds: [String],
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

// mongoSchema.pre('save', function(next) {
//   if (!this.createdAt) this.createdAt = new Date();
//   next();
// });

class UserClass extends mongoose.Model {
  static publicFields(): string[] {
    return [
      'id',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'isAdmin',
      'isGithubConnected',
      'teamId',
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

  static search(query) {
    return this.find(
      {
        $or: [
          { displayName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      },
      this.publicFields().join(' '),
    ).lean();
  }

  static async getTeamMemberList({ userId, teamId }) {
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
    });

    const template = await getEmailTemplate('welcome', {
      userName: displayName,
    });

    try {
      await sendEmail({
        from: `Kelly from builderbook.org <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      logger.error('Email sending error:', err);
    }

    return _.pick(newUser, this.publicFields());
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<IUserDocument, IUserModel>('User', mongoSchema);

export default User;
