import * as mongoose from 'mongoose';

import sendEmail from '../aws-ses';
import logger from '../logs';
import getEmailTemplate from './EmailTemplate';
import Team from './Team';
import User, { IUserDocument } from './User';

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_APP } = process.env;
const ROOT_URL = dev ? 'http://localhost:3000' : PRODUCTION_URL_APP;

mongoose.set('useFindAndModify', false);

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
  removeIfMemberAdded({ token, userId }: { token: string; userId: string });
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
  public static async add({ userId, teamId, email }) {
    if (!teamId || !email) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId).setOptions({ lean: true });
    if (!team || team.teamLeaderId !== userId) {
      throw new Error('Team does not exist or you have no permission');
    }

    const registeredUser = await User.findOne({ email })
      .select('defaultTeamSlug')
      .setOptions({ lean: true });

    if (registeredUser) {
      if (team.memberIds.includes(registeredUser._id.toString())) {
        throw new Error('This user is already Team Member.');
      } else {
        await Team.updateOne({ _id: team._id }, { $addToSet: { memberIds: registeredUser._id } });

        if (registeredUser._id !== team.teamLeaderId && !registeredUser.defaultTeamSlug) {
          await User.findByIdAndUpdate(registeredUser._id, {
            $set: { defaultTeamSlug: team.slug },
          });
        }
      }
    }

    let token;
    const invitation = await this.findOne({ teamId, email })
      .select('token')
      .setOptions({ lean: true });

    if (invitation) {
      token = invitation.token;
    } else {
      token = generateToken();
      while ((await this.countDocuments({ token })) > 0) {
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

    await sendEmail({
      from: `Kelly from async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
      to: [email],
      subject: template.subject,
      body: template.message,
    }).catch(err => {
      logger.error('Email sending error:', err);
    });

    return await this.findOne({ teamId, email }).setOptions({ lean: true });
  }

  public static async getTeamInvitedUsers({ userId, teamId }) {
    const team = await Team.findOne({ _id: teamId })
      .select('teamLeaderId')
      .setOptions({ lean: true });

    if (userId !== team.teamLeaderId) {
      throw new Error('You have no permission.');
    }

    return this.find({ teamId })
      .select('email')
      .setOptions({ lean: true });
  }

  public static async getTeamByToken({ token }) {
    if (!token) {
      throw new Error('Bad data');
    }

    const invitation = await this.findOne({ token }).setOptions({ lean: true });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    const team = await Team.findById(invitation.teamId)
      .select('name slug avatarUrl memberIds')
      .setOptions({ lean: true });

    if (!team) {
      throw new Error('Team does not exist');
    }

    return team;
  }

  public static async removeIfMemberAdded({ token, userId }) {
    if (!token) {
      throw new Error('Bad data');
    }

    const invitation = await this.findOne({ token }).setOptions({ lean: true });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    const team = await Team.findById(invitation.teamId)
      .select('name slug avatarUrl memberIds')
      .setOptions({ lean: true });

    if (team && team.memberIds.includes(userId)) {
      this.deleteOne({ token }).exec();
    }
  }

  public static async addUserToTeam({ token, user }) {
    if (!token || !user) {
      throw new Error('Bad data');
    }

    const invitation = await this.findOne({ token }).setOptions({ lean: true });

    if (!invitation || invitation.email !== user.email) {
      throw new Error('Invitation not found');
    }

    await this.deleteOne({ token });

    const team = await Team.findById(invitation.teamId)
      .select('memberIds slug teamLeaderId')
      .setOptions({ lean: true });

    if (team && !team.memberIds.includes(user._id)) {
      await Team.updateOne({ _id: team._id }, { $addToSet: { memberIds: user._id } });

      if (user._id !== team.teamLeaderId && !user.defaultTeamSlug) {
        await User.findByIdAndUpdate(user._id, { $set: { defaultTeamSlug: team.slug } });
      }
    }
  }
}

mongoSchema.loadClass(InvitationClass);

const Invitation = mongoose.model<IInvitationDocument, IInvitationModel>('Invitation', mongoSchema);

export default Invitation;
