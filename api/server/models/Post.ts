import * as mongoose from 'mongoose';

import * as marked from 'marked';
import * as he from 'he';
import * as hljs from 'highlight.js';

import Topic from './Topic';
import Team from './Team';
import Discussion from './Discussion';
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

  renderer.image = href => {
    return `
      <img
        src="${href}"
        id="s3-file"
        alt="Async"
      />
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

  edit({ content, userId, id }: { content: string; userId: string; id: string }): Promise<void>;

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

  static async getList({ userId, discussionId }) {
    await this.checkPermission({ userId, discussionId });

    return this.find({ discussionId }).sort({ createdAt: 1 });
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

    const memberIds: string[] = discussion.isPrivate
      ? discussion.memberIds.filter(id => id !== userId)
      : team.memberIds.filter(id => id !== userId);

    return post;
  }

  static async edit({ content, userId, id }) {
    if (!content || !id) {
      throw new Error('Bad data');
    }

    const post = await this.findById(id)
      .select('createdUserId discussionId')
      .lean();

    await this.checkPermission({ userId, discussionId: post.discussionId, post });

    const htmlContent = markdownToHtml(content);

    await this.updateOne(
      { _id: id },
      { content, htmlContent, isEdited: true, lastUpdatedAt: new Date() },
    );
  }

  static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const post = await this.findById(id)
      .select('createdUserId discussionId')
      .lean();

    await this.checkPermission({ userId, discussionId: post.discussionId, post });

    await this.remove({ _id: id });
  }
}

mongoSchema.loadClass(PostClass);

const Post = mongoose.model<IPostDocument, IPostModel>('Post', mongoSchema);

export default Post;
