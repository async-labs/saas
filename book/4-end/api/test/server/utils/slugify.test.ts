import '../../../server/env';
import * as mongoose from 'mongoose';
import User from '../../../server/models/User';
import { generateSlug } from '../../../server/utils/slugify';

describe('slugify', () => {
  beforeAll(async () => {
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };

    mongoose.connect(process.env.MONGO_URL, options);

    const newUsers = [
      { slug: 'john', email: 'john@example.com', createdAt: new Date() },
      { slug: 'john-johnson', email: 'john-johnson@example.com', createdAt: new Date() },
      { slug: 'john-johnson-1', email: 'john-johnson-1@example.com', createdAt: new Date() },
    ];

    await User.insertMany(newUsers);
  });

  test('not duplicated', () => {
    expect.assertions(1);

    return generateSlug(User, 'John J Johnson@#$').then((slug) => {
      expect(slug).toBe('john-j-johnson');
    });
  });

  test('one time duplicated', () => {
    expect.assertions(1);

    return generateSlug(User, ' John@#$').then((slug) => {
      expect(slug).toBe('john-1');
    });
  });

  test('multiple duplicated', () => {
    expect.assertions(1);

    return generateSlug(User, 'John & Johnson@#$').then((slug) => {
      expect(slug).toBe('john-johnson-2');
    });
  });

  afterAll(async () => {
    await User.deleteMany({ slug: 'john' });
  });
});
