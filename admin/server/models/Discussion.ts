import * as mongoose from 'mongoose';
import { uniq } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import Topic from './Topic';
import Team from './Team';
import Post, { deletePostFiles } from './Post';

const mongoSchema = new mongoose.Schema({
  createdUserId: {
    type: String,
    required: true,
  },
  topicId: {
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
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastActivityDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

mongoSchema.index({ name: 'text' });
mongoSchema.index({ topicId: 1, slug: 1 }, { unique: true });

interface IDiscussionDocument extends mongoose.Document {
  createdUserId: string;
  topicId: string;
  name: string;
  slug: string;
  memberIds: string[];
  isPrivate: boolean;
  createdAt: Date;
  lastActivityDate: Date;
}

interface IDiscussionModel extends mongoose.Model<IDiscussionDocument> {
  getList({
    userId,
    topicId,
  }: {
    userId: string;
    topicId: string;
  }): Promise<{ discussions: IDiscussionDocument[] }>;

  add({
    name,
    userId,
    topicId,
    isPrivate,
    memberIds,
  }: {
    name: string;
    userId: string;
    topicId: string;
    isPrivate: boolean;
    memberIds: string[];
  }): Promise<IDiscussionDocument>;

  edit({
    userId,
    id,
    name,
    isPrivate,
    memberIds,
  }: {
    userId: string;
    id: string;
    name: string;
    isPrivate: boolean;
    memberIds: string[];
  }): Promise<{ topicId: string }>;

  delete({ userId, id }: { userId: string; id: string }): Promise<{ topicId: string }>;
}

class DiscussionClass extends mongoose.Model {
  static async checkPermission({ userId, topicId, memberIds = [] }) {
    if (!userId || !topicId) {
      throw new Error('Bad data');
    }

    const topic = await Topic.findById(topicId)
      .select('teamId')
      .lean();

    if (!topic) {
      throw new Error('Topic not found');
    }

    const team = await Team.findById(topic.teamId)
      .select('memberIds teamLeaderId')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    // all members must be member of Team.
    for (let i = 0; i < memberIds.length; i++) {
      if (team.memberIds.indexOf(memberIds[i]) === -1) {
        throw new Error('Permission denied');
      }
    }

    return { team };
  }

  static async getList({ userId, topicId }) {
    await this.checkPermission({ userId, topicId });

    const filter: any = { topicId, $or: [{ isPrivate: false }, { memberIds: userId }] };

    const discussions: any[] = await this.find(filter)
      .sort({ lastActivityDate: -1 })
      .lean();

    return { discussions };
  }

  static async add({ name, userId, topicId, isPrivate = false, memberIds = [] }) {
    if (!name) {
      throw new Error('Bad data');
    }

    await this.checkPermission({ userId, topicId, memberIds });

    const slug = await generateNumberSlug(this, { topicId });

    return this.create({
      createdUserId: userId,
      topicId,
      name,
      slug,
      isPrivate,
      memberIds: (isPrivate && uniq([userId, ...memberIds])) || [],
      createdAt: new Date(),
    });
  }

  static async edit({ userId, id, name, isPrivate = false, memberIds = [] }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id)
      .select('topicId createdUserId')
      .lean();

    const { team } = await this.checkPermission({
      userId,
      topicId: discussion.topicId,
      memberIds,
    });

    if (discussion.createdUserId !== userId && team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only create user or team leader can update.');
    }

    await this.updateOne(
      { _id: id },
      {
        name,
        isPrivate,
        memberIds: (isPrivate && uniq([userId, ...memberIds])) || [],
      },
    );

    return { topicId: discussion.topicId };
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id)
      .select('topicId')
      .lean();

    await this.checkPermission({ userId, topicId: discussion.topicId });

    deletePostFiles(
      await Post.find({ discussionId: id })
        .select('content')
        .lean(),
    );

    await Post.remove({ discussionId: id });

    await this.remove({ _id: id });

    return { topicId: discussion.topicId };
  }

  static findBySlug(topicId: string, slug: string) {
    return this.findOne({ topicId, slug }).lean();
  }
}

mongoSchema.loadClass(DiscussionClass);

const Discussion = mongoose.model<IDiscussionDocument, IDiscussionModel>('Discussion', mongoSchema);

export default Discussion;
export { IDiscussionDocument };
