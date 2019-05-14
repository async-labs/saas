// https://www.npmjs.com/package/passwordless-mongostore-bcrypt-node

import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import * as TokenStore from 'passwordless-tokenstore';
import * as util from 'util';

interface ITokenDocument extends mongoose.Document {
  hashedToken: string;
  uid: string;
  ttl: Date;
  originUrl: string;
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
  originUrl: {
    type: String,
    required: true,
  },
});

const Collection = mongoose.model<ITokenDocument>(
  'PasswordlessToken',
  mongoSchema,
  'passwordless-token',
);

function MongoStore(options = {}) {
  TokenStore.call(this);

  this._options = options || {};
}

util.inherits(MongoStore, TokenStore);

MongoStore.prototype.authenticate = async function authenticate(token, uid, callback) {
  if (!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }

  try {
    const item = await Collection.findOne({ uid, ttl: { $gt: new Date() } });

    if (item) {
      const res = await bcrypt.compare(token, item.hashedToken);
      if (res) {
        callback(null, true, item.originUrl);
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

MongoStore.prototype.storeOrUpdate = async function storeOrUpdate(
  token,
  uid,
  msToLive,
  originUrl,
  callback,
) {
  if (!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }

  const saltRounds = 10;

  try {
    const hashedToken = await bcrypt.hash(token, saltRounds);
    const newRecord = {
      hashedToken,
      uid,
      ttl: new Date(Date.now() + msToLive),
      originUrl,
    };

    // Insert or update
    await Collection.updateOne({ uid }, newRecord, { upsert: true });
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.invalidateUser = async function invalidateUser(uid, callback) {
  if (!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }

  try {
    await Collection.deleteOne({ uid });
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.clear = async function clear(callback) {
  if (!callback) {
    throw new Error('TokenStore:clear called with invalid parameters');
  }

  try {
    await Collection.deleteMany({});
    callback();
  } catch (error) {
    callback(error);
  }
};

MongoStore.prototype.length = function length(callback) {
  Collection.countDocuments(callback);
};

export default MongoStore;
