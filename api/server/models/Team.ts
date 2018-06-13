import * as mongoose from 'mongoose';

import Topic from './Topic';

import generateSlug from '../utils/slugify';
import User from './User';

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

interface ITeamDocument extends mongoose.Document {
  teamLeaderId: string;
  name: string;
  slug: string;
  avatarUrl: string;
  createdAt: Date;

  memberIds: string[];
}

interface ITeamModel extends mongoose.Model<ITeamDocument> {
  add({
    name,
    userId,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<ITeamDocument>;
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
  }): Promise<ITeamDocument>;
  findBySlug(slug: string): Promise<ITeamDocument>;
  getList(userId: string): Promise<ITeamDocument[]>;
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
  static async add({ userId, name, avatarUrl }) {
    console.log(`Static method: ${name}, ${avatarUrl}`);

    if (!userId || !name || !avatarUrl) {
      throw new Error('Bad data');
    }

    const slug = await generateSlug(this, name);

    let defaultTeam = false;
    if ((await this.find({ teamLeaderId: userId }).count()) === 0) {
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

    await Topic.create({
      createdUserId: userId,
      teamId: team._id,
      name: 'Projects',
      slug: 'projects',
      isProjects: true,
      createdAt: new Date(),
    });

    return team;
  }

  static async updateTeam({ userId, teamId, name, avatarUrl }) {
    const team = await this.findById(teamId, 'slug name defaultTeam teamLeaderId');

    if (team.teamLeaderId !== userId) {
      throw new Error('Permission denied');
    }

    const modifier = { name: team.name, avatarUrl, slug: team.slug };

    if (name !== team.name) {
      modifier.name = name;
      modifier.slug = await generateSlug(this, name);
    }

    await this.updateOne({ _id: teamId }, { $set: modifier });

    if (team.defaultTeam) {
      await User.findByIdAndUpdate(userId, { $set: { defaultTeamSlug: modifier.slug } });
    }

    return this.findById(teamId, 'name avatarUrl slug defaultTeam').lean();
  }

  static findBySlug(slug: string) {
    return this.findOne({ slug }).lean();
  }

  static getList(userId: string) {
    return this.find({ memberIds: userId }).lean();
  }

  static async removeMember({ teamId, teamLeaderId, userId }) {
    const team = await this.findById(teamId).select('memberIds teamLeaderId');

    if (team.teamLeaderId !== teamLeaderId || teamLeaderId === userId) {
      throw new Error('Permission denied');
    }

    await this.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } });
  }
}

mongoSchema.loadClass(TeamClass);

const Team = mongoose.model<ITeamDocument, ITeamModel>('Team', mongoSchema);

export default Team;
