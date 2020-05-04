import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import * as TokenStore from 'passwordless-tokenstore';
import * as util from 'util';

import User from './models/User';

interface TokenDocument extends mongoose.Document {
  hashedToken: string;
  uid: string;
  ttl: Date;
  originUrl: string;
  email: string;
}

const mongoSchema = new mongoose.Schema({
  hashedToken: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  ttl: {
    type: Date,
    required: true,
    expires: 0,
  },
  originUrl: String,
  email: String,
});

const PasswordlessToken = mongoose.model<TokenDocument>(
  'PasswordlessToken',
  mongoSchema,
  'passwordless-token',
);

function MongoStore(options = {}) {
  TokenStore.call(this);

  this._options = options || {};
}

util.inherits(MongoStore, TokenStore);

MongoStore.prototype.authenticate = async function(token, uid, callback) {
  if (!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }

  try {
    const tokenDoc = await PasswordlessToken.findOne({ uid, ttl: { $gt: new Date() } });

    if (tokenDoc) {
      const isMatch = await bcrypt.compare(token, tokenDoc.hashedToken);
      if (isMatch) {
        if (tokenDoc.email) {
          await User.signInOrSignUpByPasswordless({ uid, email: tokenDoc.email });
        }

        callback(null, true, tokenDoc.originUrl);
      } else {
        callback(null, false, null);
      }
    } else {
      callback(null, false, null);
    }
  } catch (error) {
    callback(error, false, null);
  }
};

MongoStore.prototype.storeOrUpdate = async function(token, uid, msToLive, originUrl, callback) {
  if (!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }

  const saltRounds = 10;

  try {
    const hashedToken = await bcrypt.hash(token, saltRounds);
    const newRecord = { hashedToken, uid, ttl: new Date(Date.now() + msToLive), originUrl };

    await PasswordlessToken.updateOne(
      { uid },
      { $set: newRecord },
      { upsert: true, runValidators: true },
    );
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.invalidateUser = async function(uid, callback) {
  if (!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }

  try {
    await PasswordlessToken.deleteOne({ uid });
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.clear = async function(callback) {
  if (!callback) {
    throw new Error('TokenStore:clear called with invalid parameters');
  }

  try {
    await PasswordlessToken.deleteMany({});
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.length = function(callback) {
  PasswordlessToken.countDocuments(callback);
};

MongoStore.prototype.storeOrUpdateByEmail = async function addEmail(email: string) {
  if (!email) {
    throw new Error('TokenStore:addEmail called with invalid parameters');
  }

  const obj = await PasswordlessToken.findOne({ email })
    .select('uid')
    .setOptions({ lean: true });

  if (obj) {
    return obj.uid;
  }

  const uid = mongoose.Types.ObjectId().toHexString();
  await PasswordlessToken.updateOne({ uid }, { email }, { upsert: true });

  return uid;
};

export default MongoStore;
