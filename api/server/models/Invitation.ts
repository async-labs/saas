import * as mongoose from 'mongoose';

import Team from './Team';
import getEmailTemplate from './EmailTemplate';
import logger from '../logs';
import sendEmail from '../aws';

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
  },
  isPending: Boolean,
  isAccepted: Boolean,
});

interface IInvitationDocument extends mongoose.Document {
  teamId: string;
  email: string;
  createdAt: Date;
  isPending: boolean;
  isAccepted: boolean;
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

  getByTeamSlug({
    userId,
    userEmail,
    teamSlug,
  }: {
    userId: string;
    userEmail: string;
    teamSlug: string;
  }): { teamName: string; invitationId: string };

  acceptOrCancel({
    userId,
    userEmail,
    teamSlug,
    isAccepted,
  }: {
    userId: string;
    userEmail: string;
    teamSlug: string;
    isAccepted: boolean;
  }): Promise<void>;
}

class InvitationClass extends mongoose.Model {
  static async add({ userId, teamId, email }) {
    if (!teamId || !email) {
      throw new Error('Bad data');
    }

    if (await this.findOne({ teamId, email, isPending: true }).select('id')) {
      throw new Error('Invitation duplicated');
    }

    const team = await Team.findById(teamId).lean();
    if (!team || team.teamLeaderId !== userId) {
      throw new Error('Team does not exist');
    }

    if (team.memberIds.includes(userId)) {
      throw new Error('Already team member');
    }

    await this.create({
      teamId,
      email,
      isPending: true,
      createdAt: new Date(),
    });

    const template = await getEmailTemplate('invitation', {
      teamName: team.name,
      invitationURL: `${ROOT_URL}/invitation/${team.slug}`,
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

  static async getByTeamSlug({ userId, userEmail, teamSlug }) {
    if (!teamSlug || !userId) {
      throw new Error('Bad data');
    }

    const team = await Team.findBySlug(teamSlug);
    if (!team) {
      throw new Error('Team does not exist');
    }

    const invitation = await this.findOne({
      teamId: team._id,
      email: userEmail,
      isPending: true,
    }).lean();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    return { teamName: team.name, invitationId: invitation._id };
  }

  static async acceptOrCancel({ userId, userEmail, teamSlug, isAccepted }) {
    if (!teamSlug || !userId) {
      throw new Error('Bad data');
    }

    const team = await Team.findBySlug(teamSlug);
    if (!team) {
      throw new Error('Team does not exist');
    }

    if (team.memberIds.includes(userId)) {
      throw new Error('Already team member');
    }

    const invitation = await this.findOne({
      teamId: team._id,
      email: userEmail,
      isPending: true,
    }).lean();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (isAccepted) {
      await Team.findByIdAndUpdate(team._id, { $addToSet: { memberIds: userId } });
    }

    await this.updateOne(
      { _id: invitation._id },
      {
        isPending: false,
        isAccepted: !!isAccepted,
      },
    );
  }
}

mongoSchema.loadClass(InvitationClass);

const Invitation = mongoose.model<IInvitationDocument, IInvitationModel>('Invitation', mongoSchema);

export default Invitation;
