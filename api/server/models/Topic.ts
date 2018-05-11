import * as mongoose from 'mongoose';
import { uniq } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import Team from './Team';

// rename createdUserId to teamLeaderId

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
    unique: true,
  },
  memberIds: [String],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  lastUpdatedAt: Date,
});

interface ITopicDocument extends mongoose.Document {
  createdUserId: string;
  teamId: string;
  name: string;
  slug: string;
  memberIds: string[];
  isPrivate: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface ITopicModel extends mongoose.Model<ITopicDocument> {
  getList({ userId, teamId }: { userId: string; teamId: string }): Promise<ITopicDocument[]>;
  add({
    name,
    userId,
    teamId,
    isPrivate,
    memberIds,
  }: {
    name: string;
    userId: string;
    teamId: string;
    isPrivate: boolean;
    memberIds: string[];
  }): Promise<ITopicDocument>;

  edit({
    name,
    userId,
    id,
    isPrivate,
    memberIds,
  }: {
    name: string;
    userId: string;
    id: string;
    isPrivate: boolean;
    memberIds: string[];
  }): Promise<string>;

  delete({ userId, topicId }: { userId: string; topicId: string }): Promise<void>;
}

class TopicClass extends mongoose.Model {
  static async checkPermission({ userId, teamId, topic = null }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('memberIds')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    if (topic && topic.isPrivate && topic.memberIds.indexOf(userId) === -1) {
      throw new Error('Permission denied');
    }
  }

  static async getList({ userId, teamId }) {
    await this.checkPermission({ userId, teamId });

    return this.find({
      teamId,
      $or: [{ isPrivate: false }, { memberIds: userId }],
    }).sort({ createdAt: -1 });
  }

  static async add({ name, userId, teamId, isPrivate = false, memberIds = [] }) {
    if (!name) {
      throw new Error('Bad data');
    }

    await this.checkPermission({ userId, teamId });

    const slug = await generateNumberSlug(this, { teamId });

    return this.create({
      createdUserId: userId,
      teamId,
      name,
      slug,
      memberIds: uniq([userId, ...memberIds]),
      isPrivate: !!isPrivate,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    });
  }

  static async edit({ name, userId, id, isPrivate = false, memberIds = [] }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const topic = await this.findById(id)
      .select('memberIds isPrivate teamId')
      .lean();

    await this.checkPermission({ userId, teamId: topic.teamId, topic });

    await this.updateOne(
      { _id: id },
      {
        name,
        isPrivate: !!isPrivate,
        memberIds: uniq([userId, ...memberIds]),
        lastUpdatedAt: new Date(),
      },
    );
  }

  static async delete({ userId, topicId }) {
    if (!topicId) {
      throw new Error('Bad data');
    }

    const topic = await this.findById(topicId)
      .select('memberIds isPrivate teamId')
      .lean();

    await this.checkPermission({ userId, teamId: topic.teamId, topic });

    await this.remove({ _id: topicId });
  }

  static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).lean();
  }
}

mongoSchema.loadClass(TopicClass);
mongoSchema.index({ teamId: 1, slug: 1 }, { unique: true });

const Topic = mongoose.model<ITopicDocument, ITopicModel>('Topic', mongoSchema);

export default Topic;
