import * as mongoose from 'mongoose';

import Topic from './Topic';
import Team from './Team';
import Discussion from './Discussion';
import Notification from './Notification';
import logger from '../logs';

const mongoSchema = new mongoose.Schema({
  createdUserId: {
    type: String,
    required: true,
  },
  discussionId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  lastUpdatedAt: Date,
});

interface IMessageDocument extends mongoose.Document {
  createdUserId: string;
  discussionId: string;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface IMessageModel extends mongoose.Model<IMessageDocument> {
  getList({
    userId,
    discussionId,
  }: {
    userId: string;
    discussionId: string;
  }): Promise<IMessageDocument[]>;

  add({
    content,
    userId,
    discussionId,
  }: {
    content: string;
    userId: string;
    discussionId: string;
  }): Promise<IMessageDocument>;

  edit({ content, userId, id }: { content: string; userId: string; id: string }): Promise<void>;

  delete({ userId, id }: { userId: string; id: string }): Promise<void>;
}

class MessageClass extends mongoose.Model {
  static async checkPermission({ userId, discussionId, message = null }) {
    if (!userId || !discussionId) {
      throw new Error('Bad data');
    }

    if (message && message.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    const discussion = await Discussion.findById(discussionId)
      .select('topicId memberIds')
      .lean();

    if (!discussion) {
      throw new Error('Discussion not found');
    }

    const topic = await Topic.findById(discussion.topicId)
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

    return { discussion };
  }

  static async getList({ userId, discussionId }) {
    this.checkPermission({ userId, discussionId });

    return this.find({ discussionId });
  }

  static async add({ content, userId, discussionId }) {
    if (!content) {
      throw new Error('Bad data');
    }

    const { discussion } = await this.checkPermission({ userId, discussionId });

    const message = await this.create({
      createdUserId: userId,
      discussionId,
      content,
      createdAt: new Date(),
    });

    const memberIds: string[] = discussion.memberIds.filter(id => id !== userId);

    Notification.bulkCreate({
      userIds: memberIds,
      content: 'New message',
      params: { discussionId },
    })
      .then(() => {
        logger.info('Created "new message" notification on discussion', { discussionId });
      })
      .catch(e => {
        console.error(e);
      });

    Notification.bulkCreate({
      userIds: memberIds,
      content: 'New message',
      params: { topicId: discussion.topicId },
    })
      .then(() => {
        logger.info('Created "new message" notification on topic', { topicId: discussion.topicId });
      })
      .catch(e => {
        console.error(e);
      });

    return message;
  }

  static async edit({ content, userId, id }) {
    if (!content || !id) {
      throw new Error('Bad data');
    }

    const message = await this.findById(id)
      .select('createdUserId discussionId')
      .lean();

    this.checkPermission({ userId, discussionId: message.discussionId, message });

    await this.updateOne({ _id: id }, { content, isEdited: true, lastUpdatedAt: new Date() });
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const message = await this.findById(id)
      .select('createdUserId discussionId')
      .lean();

    this.checkPermission({ userId, discussionId: message.discussionId, message });

    await this.remove({ _id: id });
  }
}

mongoSchema.loadClass(MessageClass);

const Message = mongoose.model<IMessageDocument, IMessageModel>('Message', mongoSchema);

export default Message;
