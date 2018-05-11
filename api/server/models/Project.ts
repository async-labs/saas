import * as mongoose from 'mongoose';
import { uniq } from 'lodash';
import { difference } from 'lodash';

import { generateNumberSlug } from '../utils/slugify';
import User from './User';

// check permission using teamId
// internal API (Express routes and API methods)
// pages and components
// store

const mongoSchema = new mongoose.Schema({
  teamLeaderId: {
    type: String,
    required: true,
  },
  teamId: {
    type: String,
    required: true,
  },
  projectHillId: {
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
  projectMemberIds: [String],
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  lastUpdatedAt: Date,
  githubRepo: {
    type: String,
    required: true,
    unique: true,
  },
  githubRepoUrl: {
    type: String,
    required: true,
  },
  assignedIssues: [
    {
      issueId: String,
      number: Number,
      title: String,
      assignedMembersIds: [String],
    },
  ],
  unassignedIssues: [
    {
      issueId: String,
      number: Number,
      title: String,
      assignedMembersIds: [String],
    },
  ],
  inProgressIssues: [
    {
      issueId: String,
      number: Number,
      title: String,
      assignedMembersIds: [String],
    },
  ],
  readyForQAIssues: [
    {
      issueId: String,
      number: Number,
      title: String,
      assignedMembersIds: [String],
    },
  ],
  closedIssues: [
    {
      issueId: String,
      number: Number,
      title: String,
      assignedMembersIds: [String],
    },
  ],
});

interface IProjectDocument extends mongoose.Document {
  teamLeaderId: string;
  name: string;
  slug: string;
  projectMemberIds: string[];
  isPinned: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
}

interface IProjectModel extends mongoose.Model<IProjectDocument> {
  getList({
    userId,
    skip,
    limit,
  }: {
    userId: string;
    skip: number;
    limit: number;
  }): Promise<{ projects: IProjectDocument[]; totalCount: number }>;

  add({
    name,
    userId,
    memberIds,
  }: {
    name: string;
    userId: string;
    memberIds: string[];
  }): Promise<IProjectDocument>;

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

class ProjectClass extends mongoose.Model {
  static async checkProjectPermission({ userId }) {
    if (!userId) {
      throw new Error('Bad data');
    }

    const user = await User.findById(userId)
      .select('id teamIds projectIds')
      .lean();

    if (user.teamIds.indexOf(userId) === -1) {
      throw new Error('User is not part of this team');
    }

    if (user.projectIds.indexOf(userId) === -1) {
      throw new Error('User is not part of this project');
    }

    return { user };
  }

  static async getList({ userId, skip = 0, limit = 20 }) {
    const user = this.checkProjectPermission({ userId });

    if (!user) {
      throw new Error('Permission denied');
    }

    // search project by teamId as well
    // add teamId to arguments of checkProjectPermission function

    let projectsArray = this.find({ projectMemberIds: { $elemMatch: userId } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProjectsCount = projectsArray.count();

    return { projects: await projectsArray, totalCount: await totalProjectsCount };
  }

  static async add({ name, userId, teamId, projectMemberIds = [] }) {
    if (!name) {
      throw new Error('Bad data');
    }

    const user = this.checkProjectPermission({ userId });

    if (!user) {
      throw new Error('Permission denied');
    }

    const slug = await generateNumberSlug(this, { teamId });

    return this.create({
      teamLeaderId: userId,
      teamId,
      name,
      slug,
      projectMemberIds: uniq([userId, ...projectMemberIds]),
      createdAt: new Date(),
    });
  }

  static async edit({ id, name, userId, projectMemberIds = [] }) {
    // search project by teamId as well
    // add teamId to arguments of edit function
    if (!id) {
      throw new Error('Bad data');
    }

    const user = this.checkProjectPermission({ userId });

    if (!user) {
      throw new Error('Permission denied');
    }

    const project = await this.findById(id)
      .select('projectMemberIds')
      .lean();

    const newMemberIds = difference(projectMemberIds, project.projectMemberIds || []);
    if (newMemberIds.length > 0) {
      Project.updateOne(
        { _id: project._id },
        { projectMemberIds: uniq([...newMemberIds, ...(project.projectMemberIds || [])]) },
      ).exec();
    }

    await this.updateOne(
      { _id: id },
      {
        name,
        projectMemberIds: uniq([userId, ...projectMemberIds]),
        lastUpdatedAt: new Date(),
      },
    ).exec();
  }

  static async deleteProject({ userId, id }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const user = this.checkProjectPermission({ userId });

    if (!user) {
      throw new Error('Permission denied');
    }

    await this.remove({ _id: id }).exec();
  }

  static async pinProject({ userId, id, isPinned }) {
    if (!id) {
      throw new Error('Bad data');
    }

    const user = this.checkProjectPermission({ userId });

    if (!user) {
      throw new Error('Permission denied');
    }

    await this.updateOne(
      { _id: id },
      {
        isPinned: !!isPinned,
        lastUpdatedAt: new Date(),
      },
    ).exec();
  }

  static findBySlug(teamId: string, slug: string) {
    return this.findOne({ teamId, slug }).lean();
  }
}

mongoSchema.loadClass(ProjectClass);
mongoSchema.index({ name: 'text' });
mongoSchema.index({ teamId: 1, slug: 1 }, { unique: true });

const Project = mongoose.model<IProjectDocument, IProjectModel>('Project', mongoSchema);

export default Project;
