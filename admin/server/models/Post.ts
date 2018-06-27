import * as mongoose from 'mongoose';
import * as url from 'url';
import * as qs from 'querystring';
import { chunk } from 'lodash';

import Topic from './Topic';
import Team from './Team';
import Discussion from './Discussion';

import { deleteFiles } from '../aws-s3';

function deletePostFiles(posts: IPostDocument[]) {
  const imgRegEx = /\<img.+data-src=[\"|\'](.+?)[\"|\']/g;
  const files: { [key: string]: string[] } = {};

  posts.forEach(post => {
    let res = imgRegEx.exec(post.content);

    while (res) {
      const { bucket, path } = qs.parse(url.parse(res[1]).query);

      if (typeof bucket !== 'string' || typeof path !== 'string') {
        continue;
      }

      if (!files[bucket]) {
        files[bucket] = [];
      }

      files[bucket].push(path);

      res = imgRegEx.exec(post.content);
    }
  });

  Object.keys(files).forEach(bucket => {
    chunk(files[bucket], 1000).forEach(fileList =>
      deleteFiles(bucket, fileList).catch(err => console.log(err)),
    );
  });
}

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
  htmlContent: {
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

interface IPostDocument extends mongoose.Document {
  createdUserId: string;
  discussionId: string;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface IPostModel extends mongoose.Model<IPostDocument> {
  uploadFile({
    userId,
    id,
    fileName,
    file,
  }: {
    userId: string;
    id: string;
    fileName: string;
    file: string;
  }): Promise<void>;

  delete({ userId, id }: { userId: string; id: string }): Promise<void>;
}

class PostClass extends mongoose.Model {
  static async checkPermission({ userId, discussionId, post = null }) {
    if (!userId || !discussionId) {
      throw new Error('Bad data');
    }

    if (post && post.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    const discussion = await Discussion.findById(discussionId)
      .select('topicId memberIds isPrivate slug')
      .lean();

    if (!discussion) {
      throw new Error('Discussion not found');
    }

    if (discussion.isPrivate && discussion.memberIds.indexOf(userId) === -1) {
      throw new Error('Permission denied');
    }

    const topic = await Topic.findById(discussion.topicId)
      .select('teamId slug')
      .lean();

    if (!topic) {
      throw new Error('Topic not found');
    }

    const team = await Team.findById(topic.teamId)
      .select('memberIds slug')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return { topic, discussion, team };
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const post = await this.findById(id)
      .select('createdUserId discussionId content')
      .lean();

    await this.checkPermission({ userId, discussionId: post.discussionId, post });

    deletePostFiles([post]);

    await this.remove({ _id: id });
  }
}

mongoSchema.loadClass(PostClass);

const Post = mongoose.model<IPostDocument, IPostModel>('Post', mongoSchema);

export default Post;
export { IPostDocument, deletePostFiles };
