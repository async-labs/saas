import { uniq } from 'lodash';
import * as mongoose from 'mongoose';

import { generateNumberSlug } from '../utils/slugify';
import Team, { TeamDocument } from './Team';
import Post from './Post';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
  createdUserId: {
    type: String,
    required: true,
  },
  teamId: {
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
  },
  memberIds: [String],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notificationType: {
    type: String,
    enum: ['default', 'email'],
    required: true,
    default: 'default',
  },
});

export interface DiscussionDocument extends mongoose.Document {
  createdUserId: string;
  teamId: string;
  name: string;
  slug: string;
  memberIds: string[];
  createdAt: Date;
  notificationType: string;
}

interface DiscussionModel extends mongoose.Model<DiscussionDocument> {
  getList({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<{ discussions: DiscussionDocument[] }>;

  add({
    name,
    userId,
    teamId,
    memberIds,
    notificationType,
  }: {
    name: string;
    userId: string;
    teamId: string;
    memberIds: string[];
    notificationType: string;
  }): Promise<DiscussionDocument>;

  edit({
    userId,
    id,
    name,
    memberIds,
    notificationType,
  }: {
    userId: string;
    id: string;
    name: string;
    memberIds: string[];
    notificationType: string;
  }): Promise<DiscussionDocument>;

  delete({ userId, id }: { userId: string; id: string }): Promise<{ teamId: string }>;

  checkPermissionAndGetTeam({
    userId,
    teamId,
    memberIds,
  }: {
    userId: string;
    teamId: string;
    memberIds: string[];
  }): Promise<TeamDocument>;
}

class DiscussionClass extends mongoose.Model {
  public static async getList({ userId, teamId }) {
    await this.checkPermissionAndGetTeam({ userId, teamId });

    const filter: any = { teamId, memberIds: userId };

    const discussions: any[] = await this.find(filter).lean();

    return { discussions };
  }

  public static async add({ name, userId, teamId, memberIds = [], notificationType }) {
    if (!name) {
      throw new Error('Bad data');
    }

    await this.checkPermissionAndGetTeam({ userId, teamId, memberIds });

    const slug = await generateNumberSlug(this, { teamId });

    return this.create({
      createdUserId: userId,
      teamId,
      name,
      slug,
      memberIds: uniq([userId, ...memberIds]),
      createdAt: new Date(),
      notificationType,
    });
  }

  public static async edit({ userId, id, name, memberIds = [], notificationType }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id).select('teamId createdUserId').lean();

    const team = await this.checkPermissionAndGetTeam({
      userId,
      teamId: discussion.teamId,
      memberIds,
    });

    if (discussion.createdUserId !== userId && team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only author or team leader can edit Discussion.');
    }

    const updatedObj = await this.findOneAndUpdate(
      { _id: id },
      {
        name,
        memberIds: uniq([userId, ...memberIds]),
        notificationType,
      },
      { runValidators: true, new: true },
    );

    return updatedObj;
  }

  public static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id).select('teamId').lean();

    await this.checkPermissionAndGetTeam({ userId, teamId: discussion.teamId });

    await Post.deleteMany({ discussionId: id });

    await this.deleteOne({ _id: id });

    return { teamId: discussion.teamId };
  }

  private static async checkPermissionAndGetTeam({ userId, teamId, memberIds = [] }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId).select('memberIds teamLeaderId').lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    for (const id of memberIds) {
      if (team.memberIds.indexOf(id) === -1) {
        throw new Error('Permission denied');
      }
    }

    return team;
  }
}

mongoSchema.loadClass(DiscussionClass);

const Discussion = mongoose.model<DiscussionDocument, DiscussionModel>('Discussion', mongoSchema);

export default Discussion;
