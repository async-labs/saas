import * as mongoose from 'mongoose';

import Team from './Team';
import User, { IUserDocument } from './User';
import getEmailTemplate from './EmailTemplate';
import logger from '../logs';
import sendEmail from '../aws-ses';

const dev = process.env.NODE_ENV !== 'production';
const ROOT_URL = dev ? `http://localhost:3000` : 'https://app1.async-await.com';

const mongoSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60 * 60 * 24, // delete doc after 24 hours
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
});

mongoSchema.index({ teamId: 1, email: 1 }, { unique: true });

interface IInvitationDocument extends mongoose.Document {
  teamId: string;
  email: string;
  createdAt: Date;
  token: string;
}

interface IInvitationModel extends mongoose.Model<IInvitationDocument> {
  add({
    userId,
    teamId,
    email,
  }: {
    userId: string;
    teamId: string;
    email: string;
  }): IInvitationDocument;

  getTeamInvitedUsers({ userId, teamId }: { userId: string; teamId: string });
  getTeamByToken({ token }: { token: string });
  addUserToTeam({ token, user }: { token: string; user: IUserDocument });
}

function generateToken() {
  const gen = () =>
    Math.random()
      .toString(36)
      .substring(2, 12) +
    Math.random()
      .toString(36)
      .substring(2, 12);

  return `${gen()}`;
}

class InvitationClass extends mongoose.Model {
  static async add({ userId, teamId, email }) {
    if (!teamId || !email) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId).lean();
    if (!team || team.teamLeaderId !== userId) {
      throw new Error('Team does not exist');
    }

    const registeredUser = await User.findOne({ email }).lean();
    if (registeredUser) {
      if (team.memberIds.includes(registeredUser._id)) {
        throw new Error('Already team member');
      } else {
        await Team.update({ _id: team._id }, { $addToSet: { memberIds: registeredUser._id } });
      }
    }

    let token;
    const invitation = await this.findOne({ teamId, email })
      .select('token')
      .lean();

    if (invitation) {
      token = invitation.token;
    } else {
      token = generateToken();
      while ((await this.find({ token }).count()) > 0) {
        token = generateToken();
      }

      await this.create({
        teamId,
        email,
        token,
      });
    }

    const template = await getEmailTemplate('invitation', {
      teamName: team.name,
      invitationURL: `${ROOT_URL}/invitation?token=${token}`,
    });

    sendEmail({
      from: `Kelly from async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
      to: [email],
      subject: template.subject,
      body: template.message,
    }).catch(err => {
      logger.error('Email sending error:', err);
    });
  }

  static async getTeamInvitedUsers({ userId, teamId }) {
    const team = await Team.findOne({ _id: teamId })
      .select('teamLeaderId')
      .lean();

    if (userId !== team.teamLeaderId) {
      throw new Error('You have no permission.');
    }

    return this.find({ teamId: teamId })
      .select('email')
      .lean();
  }

  static async getTeamByToken({ token }) {
    if (!token) {
      throw new Error('Bad data');
    }

    const invitation = await this.findOne({ token }).lean();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    const team = await Team.findById(invitation.teamId)
      .select('name slug avatarUrl memberIds')
      .lean();

    if (!team) {
      throw new Error('Team does not exist');
    }

    return team;
  }

  static async addUserToTeam({ token, user }) {
    if (!token || !user) {
      throw new Error('Bad data');
    }

    const invitation = await this.findOne({ token }).lean();

    if (!invitation || invitation.email !== user.email) {
      throw new Error('Invitation not found');
    }

    await this.remove({ token });

    const team = await Team.findById(invitation.teamId)
      .select('memberIds')
      .lean();

    if (team && !team.memberIds.includes(user._id)) {
      await Team.update({ _id: team._id }, { $addToSet: { memberIds: user._id } });
    }
  }
}

mongoSchema.loadClass(InvitationClass);

const Invitation = mongoose.model<IInvitationDocument, IInvitationModel>('Invitation', mongoSchema);

export default Invitation;
