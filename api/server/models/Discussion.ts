import * as mongoose from 'mongoose';
import { uniq } from 'lodash';
import { difference } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import Topic from './Topic';
import Team from './Team';

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
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  lastUpdatedAt: Date,
});

interface IDiscussionDocument extends mongoose.Document {
  createdUserId: string;
  topicId: string;
  name: string;
  slug: string;
  memberIds: string[];
  isPinned: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface IDiscussionModel extends mongoose.Model<IDiscussionDocument> {
  getList({
    userId,
    topicId,
    searchQuery,
    skip,
    limit,
    pinnedDiscussionCount,
    initialDiscussionSlug,
    isInitialDiscussionLoaded,
  }: {
    userId: string;
    topicId: string;
    searchQuery: string;
    skip: number;
    limit: number;
    pinnedDiscussionCount: number;
    initialDiscussionSlug: string;
    isInitialDiscussionLoaded: boolean;
  }): Promise<{ discussions: IDiscussionDocument[]; totalCount: number }>;

  add({
    name,
    userId,
    topicId,
    memberIds,
  }: {
    name: string;
    userId: string;
    topicId: string;
    memberIds: string[];
  }): Promise<IDiscussionDocument>;

  edit({
    userId,
    id,
    name,
    memberIds,
  }: {
    userId: string;
    id: string;
    name: string;
    memberIds: string[];
  }): Promise<string>;

  delete({ userId, id }: { userId: string; id: string }): Promise<void>;
  togglePin({
    userId,
    id,
    isPinned,
  }: {
    userId: string;
    id: string;
    isPinned: boolean;
  }): Promise<void>;
}

class DiscussionClass extends mongoose.Model {
  static async checkPermission({ userId, topicId, memberIds = [] }) {
    if (!userId || !topicId) {
      throw new Error('Bad data');
    }

    const topic = await Topic.findById(topicId)
      .select('memberIds isPrivate teamId')
      .lean();

    if (!topic) {
      throw new Error('Topic not found');
    }

    if (topic.isPrivate && topic.memberIds.indexOf(userId) === -1) {
      throw new Error('Permission denied');
    }

    const team = await Team.findById(topic.teamId)
      .select('memberIds')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    for (let i = 0; i < memberIds.length; i++) {
      if (team.memberIds.indexOf(memberIds[i]) === -1) {
        throw new Error('Permission denied');
      }
    }

    return { topic };
  }

  static async getList({
    userId,
    topicId,
    searchQuery = '',
    skip = 0,
    limit = 10,
    pinnedDiscussionCount = 0,
    initialDiscussionSlug = '',
    isInitialDiscussionLoaded = false,
  }) {
    this.checkPermission({ userId, topicId });

    const filter: any = { topicId };

    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    let discussions: any[] = await this.find({ ...filter, isPinned: true })
      .sort({ createdAt: -1 })
      .skip(pinnedDiscussionCount)
      .limit(limit)
      .lean();

    if (
      !isInitialDiscussionLoaded &&
      initialDiscussionSlug &&
      !discussions.some(d => d.slug === initialDiscussionSlug)
    ) {
      const d = await this.findOne({ topicId, slug: initialDiscussionSlug }).lean();
      if (d) {
        discussions.push(d);
      }
    }

    let skip2 = skip - pinnedDiscussionCount;
    if (isInitialDiscussionLoaded && skip2 > 0) {
      skip2--;
    }

    if (discussions.length < limit) {
      discussions = discussions.concat(
        await this.find({ ...filter, isPinned: false, slug: { $ne: initialDiscussionSlug } })
          .sort({ createdAt: -1 })
          .skip(skip2)
          .limit(limit - discussions.length)
          .lean(),
      );
    }

    const totalCount = await this.find(filter).count();

    return { discussions, totalCount };
  }

  static async add({ name, userId, topicId, memberIds = [] }) {
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
      memberIds: uniq([userId, ...memberIds]),
      createdAt: new Date(),
    });
  }

  static async edit({ userId, id, name, memberIds = [] }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id)
      .select('topicId')
      .lean();

    const { topic } = await this.checkPermission({
      userId,
      topicId: discussion.topicId,
      memberIds,
    });

    const newMemberIds = difference(memberIds, topic.memberIds || []);
    if (newMemberIds.length > 0) {
      Topic.updateOne(
        { _id: topic._id },
        {
          memberIds: uniq([...newMemberIds, ...(topic.memberIds || [])]),
          lastUpdatedAt: new Date(),
        },
      ).exec();
    }

    await this.updateOne(
      { _id: id },
      {
        name,
        memberIds: uniq([userId, ...memberIds]),
        lastUpdatedAt: new Date(),
      },
    );
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id)
      .select('topicId')
      .lean();

    await this.checkPermission({ userId, topicId: discussion.topicId });

    await this.remove({ _id: id });
  }

  static async togglePin({ userId, id, isPinned }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const discussion = await this.findById(id)
      .select('topicId')
      .lean();

    await this.checkPermission({ userId, topicId: discussion.topicId });

    await this.updateOne(
      { _id: id },
      {
        isPinned: !!isPinned,
        lastUpdatedAt: new Date(),
      },
    );
  }

  static findBySlug(topicId: string, slug: string) {
    return this.findOne({ topicId, slug }).lean();
  }
}

mongoSchema.loadClass(DiscussionClass);
mongoSchema.index({ name: 'text' });
mongoSchema.index({ topicId: 1, slug: 1 }, { unique: true });

const Discussion = mongoose.model<IDiscussionDocument, IDiscussionModel>('Discussion', mongoSchema);

export default Discussion;
