import * as mongoose from 'mongoose';
import Stripe from 'stripe';

import { cancelSubscription } from '../stripe';
import { generateRandomSlug } from '../utils/slugify';
import User from './User';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  avatarUrl: String,
  createdAt: {
    type: Date,
    required: true,
  },
  teamLeaderId: {
    type: String,
    required: true,
  },
  memberIds: [
    {
      type: String,
      required: true,
    },
  ],
  defaultTeam: {
    type: Boolean,
    default: false,
  },
  stripeSubscription: {
    id: String,
    object: String,
    application_fee_percent: Number,
    billing: String,
    cancel_at_period_end: Boolean,
    billing_cycle_anchor: Number,
    canceled_at: Number,
    created: Number,
  },
  isSubscriptionActive: {
    type: Boolean,
    default: false,
  },
  isPaymentFailed: {
    type: Boolean,
    default: false,
  },
});

export interface TeamDocument extends mongoose.Document {
  name: string;
  slug: string;
  avatarUrl: string;
  createdAt: Date;

  teamLeaderId: string;
  memberIds: string[];
  defaultTeam: boolean;

  stripeSubscription: {
    id: string;
    object: string;
    application_fee_percent: number;
    billing: string;
    cancel_at_period_end: boolean;
    billing_cycle_anchor: number;
    canceled_at: number;
    created: number;
  };
  isSubscriptionActive: boolean;
  isPaymentFailed: boolean;
}

interface TeamModel extends mongoose.Model<TeamDocument> {
  addTeam({
    name,
    userId,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<TeamDocument>;

  updateTeam({
    userId,
    teamId,
    name,
    avatarUrl,
  }: {
    userId: string;
    teamId: string;
    name: string;
    avatarUrl: string;
  }): Promise<TeamDocument>;

  getAllTeamsForUser(userId: string): Promise<TeamDocument[]>;

  removeMember({
    teamId,
    teamLeaderId,
    userId,
  }: {
    teamId: string;
    teamLeaderId: string;
    userId: string;
  }): Promise<void>;

  subscribeTeam({
    session,
    team,
  }: {
    session: Stripe.Checkout.Session;
    team: TeamDocument;
  }): Promise<void>;

  cancelSubscription({
    teamLeaderId,
    teamId,
  }: {
    teamLeaderId: string;
    teamId: string;
  }): Promise<TeamDocument>;

  cancelSubscriptionAfterFailedPayment({
    subscriptionId,
  }: {
    subscriptionId: string;
  }): Promise<TeamDocument>;
}

class TeamClass extends mongoose.Model {
  public static async addTeam({ userId, name, avatarUrl }) {
    console.log(`Static method: ${name}, ${avatarUrl}`);

    if (!userId || !name || !avatarUrl) {
      throw new Error('Bad data');
    }

    const slug = await generateRandomSlug(this);

    let defaultTeam = false;
    if ((await this.countDocuments({ teamLeaderId: userId })) === 0) {
      await User.findByIdAndUpdate(userId, { $set: { defaultTeamSlug: slug } });
      defaultTeam = true;
    }

    const team = await this.create({
      teamLeaderId: userId,
      name,
      slug,
      avatarUrl,
      memberIds: [userId],
      createdAt: new Date(),
      defaultTeam,
    });

    return team;
  }

  public static async updateTeam({ userId, teamId, name, avatarUrl }) {
    const team = await this.findById(teamId, 'name teamLeaderId');

    if (!team) {
      throw new Error('Team not found');
    }

    if (team.teamLeaderId !== userId) {
      throw new Error('Permission denied');
    }

    const modifier = { name: team.name, avatarUrl };

    if (name !== team.name) {
      modifier.name = name;
    }

    await this.updateOne({ _id: teamId }, { $set: modifier }, { runValidators: true });

    return this.findById(teamId, 'name avatarUrl slug defaultTeam').setOptions({ lean: true });
  }

  public static getAllTeamsForUser(userId: string) {
    console.log(`userId:${userId}`);
    return this.find({ memberIds: userId }).setOptions({ lean: true });
  }

  public static async removeMember({ teamId, teamLeaderId, userId }) {
    const team = await this.findById(teamId).select('memberIds teamLeaderId');

    if (!team) {
      throw new Error('Team does not exist');
    }

    if (team.teamLeaderId !== teamLeaderId || teamLeaderId === userId) {
      throw new Error('Permission denied');
    }

    // @ts-expect-error probably problem with @types/mongoose, works with $set but not $pull
    await this.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } });
  }

  public static async subscribeTeam({
    session,
    team,
  }: {
    session: Stripe.Checkout.Session;
    team: TeamDocument;
  }) {
    if (!session.subscription) {
      throw new Error('Not subscribed');
    }

    if (!team) {
      throw new Error('User not found.');
    }

    if (team.isSubscriptionActive) {
      throw new Error('Team is already subscribed.');
    }

    const stripeSubscription = session.subscription as Stripe.Subscription;
    if (stripeSubscription.canceled_at) {
      throw new Error('Unsubscribed');
    }

    await this.updateOne({ _id: team._id }, { stripeSubscription, isSubscriptionActive: true });
  }

  public static async cancelSubscription({ teamLeaderId, teamId }) {
    const team = await this.findById(teamId).select(
      'teamLeaderId isSubscriptionActive stripeSubscription',
    );

    if (team.teamLeaderId !== teamLeaderId) {
      throw new Error('You do not have permission to subscribe Team.');
    }

    if (!team.isSubscriptionActive) {
      throw new Error('Team is already unsubscribed.');
    }

    const cancelledSubscriptionObj = await cancelSubscription({
      subscriptionId: team.stripeSubscription.id,
    });

    return this.findByIdAndUpdate(
      teamId,
      {
        stripeSubscription: cancelledSubscriptionObj,
        isSubscriptionActive: false,
      },
      { new: true, runValidators: true },
    )
      .select('isSubscriptionActive stripeSubscription')
      .setOptions({ lean: true });
  }

  public static async cancelSubscriptionAfterFailedPayment({ subscriptionId }) {
    const team: any = await this.find({ 'stripeSubscription.id': subscriptionId })
      .select('teamLeaderId isSubscriptionActive stripeSubscription isPaymentFailed')
      .setOptions({ lean: true });
    if (!team.isSubscriptionActive) {
      throw new Error('Team is already unsubscribed.');
    }
    if (team.isPaymentFailed) {
      throw new Error('Team is already unsubscribed after failed payment.');
    }
    const cancelledSubscriptionObj = await cancelSubscription({
      subscriptionId,
    });
    return this.findByIdAndUpdate(
      team._id,
      {
        stripeSubscription: cancelledSubscriptionObj,
        isSubscriptionActive: false,
        isPaymentFailed: true,
      },
      { new: true, runValidators: true },
    )
      .select('isSubscriptionActive stripeSubscription isPaymentFailed')
      .setOptions({ lean: true });
  }
}

mongoSchema.loadClass(TeamClass);

const Team = mongoose.model<TeamDocument, TeamModel>('Team', mongoSchema);

export default Team;
