import * as mongoose from 'mongoose';
import { uniq } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import Team from './Team';
import Discussion from './Discussion';
import Post from './Post';

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
  createdAt: {
    type: Date,
    required: true,
  },
  isProjects: {
    type: Boolean,
    required: true,
    default: false,
  },
  isKnowledge: {
    type: Boolean,
    required: true,
    default: false,
  },
  lastUpdatedAt: Date,
});

interface ITopicDocument extends mongoose.Document {
  createdUserId: string;
  teamId: string;
  name: string;
  slug: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface ITopicModel extends mongoose.Model<ITopicDocument> {
  getList({ userId, teamId }: { userId: string; teamId: string }): Promise<ITopicDocument[]>;
  getPrivateTopic({
    userId,
    teamId,
    topicSlug,
  }: {
    userId: string;
    teamId: string;
    topicSlug: string;
  }): Promise<ITopicDocument[]>;
  add({
    name,
    userId,
    teamId,
  }: {
    name: string;
    userId: string;
    teamId: string;
  }): Promise<ITopicDocument>;

  edit({
    name,
    userId,
    id,
  }: {
    name: string;
    userId: string;
    id: string;
  }): Promise<{ teamId: string }>;

  delete({ userId, id }: { userId: string; id: string }): Promise<{ teamId: string }>;
}

class TopicClass extends mongoose.Model {
  static async checkPermission({ userId, teamId, topic = null }) {
    if (!userId || !teamId) {
      throw new Error('Bad data');
    }

    const team = await Team.findById(teamId)
      .select('memberIds teamLeaderId')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return { team };
  }

  static async getList({ userId, teamId }) {
    await this.checkPermission({ userId, teamId });

    return this.find({ teamId })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getPrivateTopic({ userId, teamId, topicSlug }) {
    await this.checkPermission({ userId, teamId });

    return this.find({ teamId, slug: topicSlug }).lean();
  }

  static async add({ name, userId, teamId }) {
    if (!name) {
      throw new Error('Bad data');
    }

    const { team } = await this.checkPermission({ userId, teamId });
    if (team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only team leader can create topic');
    }

    const slug = await generateNumberSlug(this, { teamId });

    return this.create({
      createdUserId: userId,
      teamId,
      name,
      slug,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    });
  }

  static async edit({ name, userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const topic = await this.findById(id)
      .select('teamId')
      .lean();

    const { team } = await this.checkPermission({ userId, teamId: topic.teamId, topic });
    if (team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only team leader can edit topic');
    }

    await this.updateOne(
      { _id: id },
      {
        name,
        lastUpdatedAt: new Date(),
      },
    );

    return { teamId: topic.teamId };
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const topic = await this.findById(id)
      .select('teamId')
      .lean();

    const { team } = await this.checkPermission({ userId, teamId: topic.teamId, topic });
    if (team.teamLeaderId !== userId) {
      throw new Error('Permission denied. Only team leader can delete topic');
    }

    const discussions = await Discussion.find({ topicId: id }, '_id');

    const discussionIds = discussions.map(d => d._id);

    await Post.remove({ discussionId: discussionIds });
    await Discussion.remove({ _id: discussionIds });

    await this.remove({ _id: id });

    return { teamId: topic.teamId };
  }

  static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).lean();
  }
}

mongoSchema.loadClass(TopicClass);
mongoSchema.index({ teamId: 1, slug: 1 }, { unique: true });

const Topic = mongoose.model<ITopicDocument, ITopicModel>('Topic', mongoSchema);

export default Topic;
export { ITopicDocument };
