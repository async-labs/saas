const slugify = text =>
  text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Replace & with 'and'
    .replace(/&/g, '-and-')
    // Remove all non-word chars
    .replace(/(?!\w)[\x00-\xC0]/g, '-') // eslint-disable-line
    // Replace multiple - with single -
    .trim('-')
    .replace(/\-\-+/g, '-') // eslint-disable-line
    // Remove - from start & end
    .replace(/-$/, '')
    .replace(/^-/, '');

async function createUniqueSlug(Model, slug, count, filter) {
  const obj = await Model.findOne({ slug: `${slug}-${count}`, ...filter })
    .select('_id')
    .lean();

  if (!obj) {
    return `${slug}-${count}`;
  }

  return createUniqueSlug(Model, slug, count + 1, filter);
}

async function generateSlug(Model, name, filter = {}) {
  const origSlug = slugify(name);

  const obj = await Model.findOne({ slug: origSlug, ...filter })
    .select('_id')
    .lean();

  if (!obj) {
    return origSlug;
  }

  return createUniqueSlug(Model, origSlug, 1, filter);
}

async function generateNumberSlug(Model, filter = {}, number = 1) {
  const obj = await Model.findOne({ slug: number, ...filter })
    .select('_id')
    .lean();

  if (!obj) {
    return `${number}`;
  }

  return generateNumberSlug(Model, filter, ++number);
}

export { generateSlug, generateNumberSlug };