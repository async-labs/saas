import { uniq } from 'lodash';
import * as mongoose from 'mongoose';

import { generateNumberSlug } from '../utils/slugify';
import Post, { deletePostFiles } from './Post';
import Team from './Team';

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

interface DiscussionDocument extends mongoose.Document {
  createdUserId: string;
  teamId: string;
  name: string;
  slug: string;
  memberIds: string[];
  createdAt: Date;
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
}

class DiscussionClass extends mongoose.Model {
  public static async checkPermission({ userId, teamId, memberIds = [] }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('memberIds teamLeaderId')
      .setOptions({ lean: true });

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    // all members must be member of Team.
    for (const id of memberIds) {
      if (team.memberIds.indexOf(id) === -1) {
        throw new Error('Permission denied');
      }
    }

    return { team };
  }

  public static async getList({ userId, teamId }) {
    await this.checkPermission({ userId, teamId });

    // eslint-disable-next-line
    const filter: any = { teamId, memberIds: userId };

    // eslint-disable-next-line
    const discussions: any[] = await this.find(filter).setOptions({ lean: true });

    return { discussions };
  }

  public static async add({ name, userId, teamId, memberIds = [], notificationType }) {
    if (!name) {
      throw new Error('Bad data');
    }

    await this.checkPermission({ userId, teamId, memberIds });

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

    const discussion = await this.findById(id)
      .select('teamId createdUserId')
      .setOptions({ lean: true });

    const { team } = await this.checkPermission({
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

    const discussion = await this.findById(id)
      .select('teamId')
      .setOptions({ lean: true });

    await this.checkPermission({ userId, teamId: discussion.teamId });

    deletePostFiles(
      await Post.find({ discussionId: id })
        .select('content')
        .setOptions({ lean: true }),
    );

    await Post.deleteMany({ discussionId: id });

    await this.deleteOne({ _id: id });

    return { teamId: discussion.teamId };
  }

  public static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).setOptions({ lean: true });
  }
}

mongoSchema.loadClass(DiscussionClass);

const Discussion = mongoose.model<DiscussionDocument, DiscussionModel>('Discussion', mongoSchema);

export default Discussion;
export { DiscussionDocument };
