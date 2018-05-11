import * as mongoose from 'mongoose';

import generateSlug from '../utils/slugify';

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
  add({ name, userId }: { name: string; userId: string }): Promise<ITeamDocument>;
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
  static async add({ name, userId }) {
    if (!name || !userId) {
      throw new Error('Bad data');
    }

    const slug = await generateSlug(this, name);

    return this.create({
      teamLeaderId: userId,
      name,
      slug,
      memberIds: [userId],
      createdAt: new Date(),
    });
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
