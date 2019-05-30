import { generateSlug } from '../../../server/utils/slugify';

const MockUser = {
  slugs: ['john-and-jonhson', 'john-and-jonhson-1', 'john'],
  findOne({ slug }) {
    if (this.slugs.includes(slug)) {
      return Promise.resolve({
        id: 'id', select() {
          return this.id;
        },
      });
    }

    return Promise.resolve(null);
  },
};

describe('slugify', () => {
  test('not duplicated', () => {
    expect.assertions(1);

    return generateSlug(MockUser, 'John J Jonhson@#$').then((slug) => {
      expect(slug).toBe('john-j-jonhson');
    });
  });

  test('one time duplicated', () => {
    expect.assertions(1);

    return generateSlug(MockUser, ' John@#$').then((slug) => {
      expect(slug).toBe('john-1');
    });
  });

  test('multiple duplicated', () => {
    expect.assertions(1);

    return generateSlug(MockUser, 'John & Jonhson@#$').then((slug) => {
      expect(slug).toBe('john-and-jonhson-2');
    });
  });
});
