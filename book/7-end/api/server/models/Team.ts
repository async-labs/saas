import * as mongoose from 'mongoose';

import { generateNumberSlug } from '../utils/slugify';
import User from './User';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
  teamLeaderId: {
    type: String,
    required: true,
  },
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
  memberIds: [String],
  defaultTeam: {
    type: Boolean,
    default: false,
  },
});

export interface TeamDocument extends mongoose.Document {
  teamLeaderId: string;
  name: string;
  slug: string;
  avatarUrl: string;
  createdAt: Date;

  memberIds: string[];
}

interface TeamModel extends mongoose.Model<TeamDocument> {
  add({ name, userId }: { userId: string; name: string; avatarUrl: string }): Promise<TeamDocument>;
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
  findBySlug(slug: string): Promise<TeamDocument>;
  getList(userId: string): Promise<TeamDocument[]>;
  removeMember({
    teamId,
    teamLeaderId,
    userId,
  }: {
    teamId: string;
    teamLeaderId: string;
    userId: string;
  }): Promise<void>;
}

class TeamClass extends mongoose.Model {
  public static async add({ userId, name, avatarUrl }) {
    console.log(`Static method: ${name}, ${avatarUrl}`);

    if (!userId || !name || !avatarUrl) {
      throw new Error('Bad data');
    }

    const slug = await generateNumberSlug(this);

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
    const team = await this.findById(teamId, 'slug name defaultTeam teamLeaderId');

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

    if (team.defaultTeam) {
      await User.findByIdAndUpdate(userId, { $set: { defaultTeamSlug: modifier.slug } });
    }

    return this.findById(
      teamId,
      'name avatarUrl slug defaultTeam isSubscriptionActive stripeSubscription',
    ).setOptions({ lean: true });
  }

  public static findBySlug(slug: string) {
    return this.findOne({ slug }).setOptions({ lean: true });
  }

  public static getList(userId: string) {
    return this.find({ memberIds: userId }).setOptions({ lean: true });
  }

  public static async removeMember({ teamId, teamLeaderId, userId }) {
    const team = await this.findById(teamId).select('memberIds teamLeaderId');

    if (team.teamLeaderId !== teamLeaderId || teamLeaderId === userId) {
      throw new Error('Permission denied');
    }

    await this.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } });
  }
}

mongoSchema.loadClass(TeamClass);

const Team = mongoose.model<TeamDocument, TeamModel>('Team', mongoSchema);

export default Team;
