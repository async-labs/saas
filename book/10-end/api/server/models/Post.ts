import * as mongoose from 'mongoose';

import * as he from 'he';
import hljs from 'highlight.js';
import { marked } from 'marked';

import Discussion from './Discussion';
import Team from './Team';

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
  lastUpdatedAt: Date,
  createdAt: {
    type: Date,
    required: true,
  },
});

function markdownToHtml(content) {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    const t = title ? ` title="${title}"` : '';

    if (text.startsWith('<code>@#')) {
      return `${text.replace('<code>@#', '<code>@')} `;
    }

    return `
      <a target="_blank" href="${href}" rel="noopener noreferrer"${t}>
        ${text}
      </a>
    `;
  };

  renderer.code = (code, infostring: string) => {
    const [lang] = infostring.split(' | ');

    const language = hljs.getLanguage(lang) ? lang : 'plaintext';

    return `<pre><code class="hljs language-${lang}">${
      hljs.highlight(code, { language }).value
    }</code></pre>`;
  };

  marked.setOptions({
    renderer,
    breaks: true,
  });

  return marked(he.decode(content));
}

export interface PostDocument extends mongoose.Document {
  createdUserId: string;
  discussionId: string;
  content: string;
  isEdited: boolean;
  lastUpdatedAt: Date;
  createdAt: Date;
}

interface PostModel extends mongoose.Model<PostDocument> {
  getList({
    userId,
    discussionId,
  }: {
    userId: string;
    discussionId: string;
  }): Promise<PostDocument[]>;

  add({
    content,
    userId,
    discussionId,
  }: {
    content: string;
    userId: string;
    discussionId: string;
  }): Promise<PostDocument>;

  edit({
    content,
    userId,
    id,
  }: {
    content: string;
    userId: string;
    id: string;
  }): Promise<PostDocument>;

  delete({ userId, id }: { userId: string; id: string }): Promise<void>;

  checkPermissionAndGetTeamAndDiscussion({
    userId,
    discussionId,
    post,
  }: {
    userId: string;
    discussionId: string;
    post: PostDocument;
  }): Promise<{ TeamDocument; DiscussionDocument }>;
}

class PostClass extends mongoose.Model {
  public static async getList({ userId, discussionId }) {
    await this.checkPermissionAndGetTeamAndDiscussion({ userId, discussionId });

    const filter: any = { discussionId };

    const posts: any[] = await this.find(filter).sort({ createdAt: 1 }).setOptions({ lean: true });

    return posts;
  }

  public static async add({ content, userId, discussionId }) {
    if (!content) {
      throw new Error('Bad data');
    }

    await this.checkPermissionAndGetTeamAndDiscussion({ userId, discussionId });

    const htmlContent = markdownToHtml(content);

    const post = await this.create({
      createdUserId: userId,
      discussionId,
      content,
      htmlContent,
      createdAt: new Date(),
    });

    return post;
  }

  public static async edit({ content, userId, id }) {
    if (!content || !id) {
      throw new Error('Bad data');
    }

    const post = await this.findById(id)
      .select('createdUserId discussionId')
      .setOptions({ lean: true });

    await this.checkPermissionAndGetTeamAndDiscussion({
      userId,
      discussionId: post.discussionId,
      post,
    });

    const htmlContent = markdownToHtml(content);

    const updatedObj = await this.findOneAndUpdate(
      { _id: id },
      { content, htmlContent, isEdited: true, lastUpdatedAt: new Date() },
      { runValidators: true, new: true },
    );

    return updatedObj;
  }

  public static async delete({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const post = await this.findById(id)
      .select('createdUserId discussionId content')
      .setOptions({ lean: true });

    await this.checkPermissionAndGetTeamAndDiscussion({
      userId,
      discussionId: post.discussionId,
      post,
    });

    await this.deleteOne({ _id: id });
  }

  private static async checkPermissionAndGetTeamAndDiscussion({
    userId,
    discussionId,
    post = null,
  }) {
    if (!userId || !discussionId) {
      throw new Error('Bad data');
    }

    if (post && post.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    const discussion = await Discussion.findById(discussionId)
      .select('teamId memberIds slug')
      .setOptions({ lean: true });

    if (!discussion) {
      throw new Error('Discussion not found');
    }

    if (discussion.memberIds.indexOf(userId) === -1) {
      throw new Error('Permission denied');
    }

    const team = await Team.findById(discussion.teamId)
      .select('memberIds slug')
      .setOptions({ lean: true });

    if (!team || team.memberIds.indexOf(userId) === -1) {
      throw new Error('Team not found');
    }

    return { team, discussion };
  }
}

mongoSchema.loadClass(PostClass);

const Post = mongoose.model<PostDocument, PostModel>('Post', mongoSchema);

export default Post;
