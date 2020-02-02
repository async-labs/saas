import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import { generateSlug } from '../utils/slugify';

import logger from '../logs';

mongoose.set('useFindAndModify', false);

const mongoSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: String,
  avatarUrl: String,
  darkTheme: Boolean,
});

export interface UserDocument extends mongoose.Document {
  slug: string;
  createdAt: Date;
  email: string;
  displayName: string;
  avatarUrl: string;
  darkTheme: boolean;
}

interface UserModel extends mongoose.Model<UserDocument> {
  publicFields(): string[];

  updateProfile({
    userId,
    name,
    avatarUrl,
  }: {
    userId: string;
    name: string;
    avatarUrl: string;
  }): Promise<UserDocument[]>;

  toggleTheme({ userId, darkTheme }: { userId: string; darkTheme: boolean }): Promise<void>;
}

class UserClass extends mongoose.Model {
  public static async updateProfile({ userId, name, avatarUrl }) {
    const user = await this.findById(userId, 'slug displayName');

    const modifier = { displayName: user.displayName, avatarUrl, slug: user.slug };

    if (name !== user.displayName) {
      modifier.displayName = name;
      modifier.slug = await generateSlug(this, name);
    }

    return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
      .select('displayName avatarUrl slug')
      .setOptions({ lean: true });
  }

  public static publicFields(): string[] {
    return ['_id', 'id', 'displayName', 'email', 'avatarUrl', 'slug', 'darkTheme'];
  }

  public static toggleTheme({ userId, darkTheme }) {
    return this.updateOne({ _id: userId }, { darkTheme: !!darkTheme });
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model<UserDocument, UserModel>('User', mongoSchema);
User.ensureIndexes((err) => {
  if (err) {
    logger.error(`User.ensureIndexes: ${err.stack}`);
  }
});

export default User;
