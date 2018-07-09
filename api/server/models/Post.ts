import * as mongoose from 'mongoose';

import * as marked from 'marked';
import * as he from 'he';
import * as hljs from 'highlight.js';

import * as url from 'url';
import * as qs from 'querystring';
import { chunk } from 'lodash';

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

function markdownToHtml(content) {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    const t = title ? ` title="${title}"` : '';
    return `
      <a target="_blank" href="${href}" rel="noopener noreferrer"${t}>
        ${text}
        <i class="material-icons" style="font-size: 16px; vertical-align: baseline">
          launch
        </i>
      </a>
    `;
  };

  marked.setOptions({
    renderer,
    breaks: true,
    highlight(code, lang) {
      if (!lang) {
        return hljs.highlightAuto(code).value;
      }

      return hljs.highlight(lang, code).value;
    },
  });

  return marked(he.decode(content));
}

interface IPostDocument extends mongoose.Document {
  createdUserId: string;
  discussionId: string;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface IPostModel extends mongoose.Model<IPostDocument> {
  getList({
    userId,
    discussionId,
  }: {
    userId: string;
    discussionId: string;
  }): Promise<IPostDocument[]>;

  add({
    content,
    userId,
    discussionId,
  }: {
    content: string;
    userId: string;
    discussionId: string;
  }): Promise<IPostDocument>;

  edit({
    content,
    userId,
    id,
  }: {
    content: string;
    userId: string;
    id: string;
  }): Promise<{ discussionId: string; htmlContent: string }>;

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
      .select('teamId memberIds slug')
      .lean();

    if (!discussion) {
      throw new Error('Discussion not found');
    }

    if (discussion.memberIds.indexOf(userId) === -1) {
      throw new Error('Permission denied');
    }

    const team = await Team.findById(discussion.teamId)
      .select('memberIds slug')
      .lean();

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return { team, discussion };
  }

  static async getList({ userId, discussionId }) {
    await this.checkPermission({ userId, discussionId });

    const filter: any = { discussionId };

    return this.find(filter).sort({ createdAt: 1 });
  }

  static async add({ content, userId, discussionId }) {
    if (!content) {
      throw new Error('Bad data');
    }

    const { discussion, team } = await this.checkPermission({ userId, discussionId });

    const htmlContent = markdownToHtml(content);

    const post = await this.create({
      createdUserId: userId,
      discussionId,
      content,
      htmlContent,
      createdAt: new Date(),
    });

    const memberIds: string[] = discussion.memberIds.filter(id => id !== userId);

    return post;
  }

  static async edit({ content, userId, id }) {
    if (!content || !id) {
      throw new Error('Bad data');
    }

    // TODO: old uploaded file deleted, delete it from S3

    const post = await this.findById(id)
      .select('createdUserId discussionId')
      .lean();

    await this.checkPermission({ userId, discussionId: post.discussionId, post });

    const htmlContent = markdownToHtml(content);

    await this.updateOne(
      { _id: id },
      { content, htmlContent, isEdited: true, lastUpdatedAt: new Date() },
    );

    return { discussionId: post.discussionId, htmlContent };
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
