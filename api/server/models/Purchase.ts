import * as mongoose from 'mongoose';

class PurchaseClass {}

const mongoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  bookmarks: [
    {
      chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      hash: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    required: true,
  },
  stripeCharge: {
    id: String,
    amount: Number,
    created: Number,
    livemode: Boolean,
    paid: Boolean,
    status: String,
  },

  isPreorder: {
    type: Boolean,
    defaultValue: false,
  },

  isFree: {
    type: Boolean,
    defaultValue: false,
  },
});

mongoSchema.loadClass(PurchaseClass);
mongoSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Purchase = mongoose.model('Purchase', mongoSchema);

export default Purchase;
