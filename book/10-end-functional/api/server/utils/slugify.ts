import * as _ from 'lodash';

const slugify = (text) => _.kebabCase(text);

async function createUniqueSlug(Model, slug, count, filter) {
  const obj = await Model.findOne({ slug: `${slug}-${count}`, ...filter })
    .select('_id')
    .setOptions({ lean: true });

  if (!obj) {
    return `${slug}-${count}`;
  }

  return createUniqueSlug(Model, slug, count + 1, filter);
}

async function generateSlug(Model, name, filter = {}) {
  const origSlug = slugify(name);

  const obj = await Model.findOne({ slug: origSlug, ...filter })
    .select('_id')
    .setOptions({ lean: true });

  if (!obj) {
    return origSlug;
  }

  return createUniqueSlug(Model, origSlug, 1, filter);
}

async function generateRandomSlug(Model, filter = {}) {
  const randomString12 =
    Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

  const obj = await Model.findOne({ slug: randomString12, ...filter })
    .select('_id')
    .setOptions({ lean: true });

  if (!obj) {
    return randomString12;
  }

  return generateRandomSlug(Model, filter);
}

export { generateSlug, generateRandomSlug };
