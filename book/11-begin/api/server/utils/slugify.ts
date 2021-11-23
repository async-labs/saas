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

async function generateNumberSlug(Model, filter = {}, n = 1) {
  const obj = await Model.findOne({ slug: n, ...filter })
    .select('_id')
    .setOptions({ lean: true });

  if (!obj) {
    return `${n}`;
  }

  return generateNumberSlug(Model, filter, ++n);
}

export { generateSlug, generateNumberSlug };
