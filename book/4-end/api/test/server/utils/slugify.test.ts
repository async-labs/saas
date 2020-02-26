import '../../../server/env';

import mockingoose from 'mockingoose';
import User from '../../../server/models/User';
import { generateSlug } from '../../../server/utils/slugify';

describe('slugify', () => {
  const slugs = ['john-and-johnson', 'john-and-johnson-1', 'john'];

  const finderMock = (query) => {
    if (slugs.includes(query.getQuery().slug)) {
      return { id: 'id' };
    }
  };

  mockingoose(User).toReturn(finderMock, 'findOne');

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
      expect(slug).toBe('john-and-johnson-2');
    });
  });

  afterAll(() => {
    mockingoose(User).reset();
  });
});
