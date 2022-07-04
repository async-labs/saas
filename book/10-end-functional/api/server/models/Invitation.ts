import * as mongoose from 'mongoose';

import sendEmail from '../aws-ses';
import getEmailTemplate from './EmailTemplate';
import Team from './Team';
import User, { UserDocument } from './User';

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

interface InvitationDocument extends mongoose.Document {
  teamId: string;
  email: string;
  createdAt: Date;
  token: string;
}

interface InvitationModel extends mongoose.Model<InvitationDocument> {
  add({
    userId,
    teamId,
    email,
  }: {
    userId: string;
    teamId: string;
    email: string;
  }): InvitationDocument;

  getTeamInvitations({ userId, teamId }: { userId: string; teamId: string });
  getTeamByToken({ token }: { token: string });
  addUserToTeam({ token, user }: { token: string; user: UserDocument });
}

function generateToken() {
  const gen = () =>
    Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

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

    const registeredUser = await User.findOne({ email }).setOptions({ lean: true });

    if (registeredUser && team.memberIds.includes(registeredUser._id.toString())) {
      throw new Error('This user is already Team Member.');
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

    const dev = process.env.NODE_ENV !== 'production';

    const emailTemplate = await getEmailTemplate('invitation', {
      teamName: team.name,
      invitationURL: `${
        dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP
      }/invitation?token=${token}`,
    });

    if (!emailTemplate) {
      throw new Error('Invitation email template not found');
    }

    try {
      await sendEmail({
        from: `Kelly from saas-app.async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: emailTemplate.subject,
        body: emailTemplate.message,
      });
    } catch (err) {
      console.log('Email sending error:', err);
    }

    return await this.findOne({ teamId, email }).setOptions({ lean: true });
  }

  public static async getTeamInvitations({ userId, teamId }) {
    const team = await Team.findOne({ _id: teamId })
      .select('teamLeaderId')
      .setOptions({ lean: true });

    if (userId !== team.teamLeaderId) {
      throw new Error('You have no permission.');
    }

    return this.find({ teamId }).select('email').setOptions({ lean: true });
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

    if (!team) {
      throw new Error('Team does not exist');
    }

    if (team && !team.memberIds.includes(user._id)) {
      await Team.updateOne({ _id: team._id }, { $addToSet: { memberIds: user._id } });

      if (user._id !== team.teamLeaderId) {
        await User.findByIdAndUpdate(user._id, { $set: { defaultTeamSlug: team.slug } });
      }
    }

    return team.slug;
  }
}

mongoSchema.loadClass(InvitationClass);

const Invitation = mongoose.model<InvitationDocument, InvitationModel>('Invitation', mongoSchema);

export default Invitation;
