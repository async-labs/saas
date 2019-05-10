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

MongoStore.prototype.authenticate = function authenticate(token, uid, callback) {
  if (!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }

  Collection.findOne({ uid, ttl: { $gt: new Date() } }, (err, item) => {
    if (err) {
      callback(err, false, null);
    } else if (item) {
      bcrypt.compare(token, item.hashedToken, (err2, res) => {
        if (err2) {
          callback(err2, false, null);
        } else if (res) {
          callback(null, true, item.originUrl);
        } else {
          callback(null, false, null);
        }
      });
    } else {
      callback(null, false, null);
    }
  });
};

MongoStore.prototype.storeOrUpdate = function storeOrUpdate(
  token,
  uid,
  msToLive,
  originUrl,
  callback,
) {
  if (!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }

  bcrypt.hash(token, null, null, (err, hashedToken) => {
    if (err) {
      return callback(err);
    }

    const newRecord = {
      hashedToken,
      uid,
      ttl: new Date(Date.now() + msToLive),
      originUrl,
    };

    // Insert or update
    Collection.update({ uid }, newRecord, { upsert: true }, err2 => {
      if (err2) {
        callback(err2);
      } else {
        callback();
      }
    });
  });
};

MongoStore.prototype.invalidateUser = function invalidateUser(uid, callback) {
  if (!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }

  Collection.remove({ uid }, err => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

MongoStore.prototype.clear = function clear(callback) {
  if (!callback) {
    throw new Error('TokenStore:clear called with invalid parameters');
  }

  Collection.remove({}, err => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

MongoStore.prototype.length = function length(callback) {
  Collection.countDocuments(callback);
};

export default MongoStore;
