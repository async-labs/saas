import * as mongoose from 'mongoose';

import { generateNumberSlug } from '../utils/slugify';
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
  memberIds: {
    type: [String],
    required: true,
  },
  defaultTeam: {
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
}

class TeamClass extends mongoose.Model {
  public static async addTeam({ userId, name, avatarUrl }) {
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

    if (team.teamLeaderId !== teamLeaderId || teamLeaderId === userId) {
      throw new Error('Permission denied');
    }

    await this.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } });
  }
}

mongoSchema.loadClass(TeamClass);

const Team = mongoose.model<TeamDocument, TeamModel>('Team', mongoSchema);

export default Team;
