import * as mongoose from 'mongoose';
import { uniq } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import Topic from './Topic';
import Team from './Team';
import Post from './Post';

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

mongoSchema.index({ name: 'text' });
mongoSchema.index({ topicId: 1, slug: 1 }, { unique: true });

interface IDiscussionDocument extends mongoose.Document {
  createdUserId: string;
  topicId: string;
  name: string;
  slug: string;
  memberIds: string[];
  isPrivate: boolean;
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
    searchQuery?: string;
    skip?: number;
    limit?: number;
    pinnedDiscussionCount?: number;
    initialDiscussionSlug?: string;
    isInitialDiscussionLoaded?: boolean;
  }): Promise<{ discussions: IDiscussionDocument[]; totalCount: number }>;

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
    await this.checkPermission({ userId, topicId });

    const initialFilter: any = { topicId, $or: [{ isPrivate: false }, { memberIds: userId }] };
    const filter: any = { ...initialFilter };

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
      const d = await this.findOne({ ...initialFilter, slug: initialDiscussionSlug }).lean();
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

    await Post.remove({ discussionId: id });

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

const Discussion = mongoose.model<IDiscussionDocument, IDiscussionModel>('Discussion', mongoSchema);

export default Discussion;
