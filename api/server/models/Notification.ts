import * as mongoose from 'mongoose';

const mongoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  content: String,
  createdAt: {
    type: Date,
    required: true,
  },

  discussionId: String,
  topicId: String,
});

interface INotificationDocument extends mongoose.Document {
  userId: string;
  content: string;
  createdAt: Date;

  discussionId?: string;
  topicId?: string;
}

interface INotificationModel extends mongoose.Model<INotificationDocument> {
  getList({ userId, params }: { userId: string; params?: any }): Promise<INotificationDocument[]>;
  bulkDelete({ userId, ids }: { userId: string; ids: string[] }): Promise<void>;
  bulkCreate({
    userIds,
    content,
    params,
  }: {
    userIds: string[];
    content: string;
    params: any;
  }): Promise<void>;
}

class NotificationClass extends mongoose.Model {
  static getList({ userId, params = {} }) {
    return this.find({ userId, ...params });
  }

  static add({ userId, content, params }) {
    return this.updateOne(
      {
        userId,
        ...params,
      },
      {
        content,
        createdAt: new Date(),
      },
      { upsert: true },
    );
  }

  static async bulkDelete({ userId, ids }: { userId: string; ids: string[] }) {
    if (!userId || !ids || ids.length === 0) {
      throw new Error('Bad data');
    }

    const notifications = await this.find({ id: { $in: ids } })
      .select('userId')
      .lean();

    for (let i = 0; i < notifications.length; i++) {
      if (notifications[i].userId !== userId) {
        throw new Error('Permission denied');
      }
    }

    await this.remove({ _id: { $in: ids } });
  }

  static bulkCreate({ userIds, content, params }) {
    return Promise.all(userIds.map(userId => this.add({ userId, content, params })));
  }
}

mongoSchema.loadClass(NotificationClass);

const Notification = mongoose.model<INotificationDocument, INotificationModel>(
  'Notification',
  mongoSchema,
);

export default Notification;
