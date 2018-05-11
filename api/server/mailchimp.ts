import request from 'request';
import crypto from 'crypto';

require('dotenv').config();

const LIST_IDS = {
  preordered: process.env.MAILCHIMP_PREORDERED_LIST_ID,
  ordered: process.env.MAILCHIMP_PURCHASED_LIST_ID,
};

function callAPI({ path, method, data }: { path: string; method: string; data?: any }) {
  const ROOT_URI = `https://${process.env.MAILCHIMP_REGION}.api.mailchimp.com/3.0`;

  const API_KEY = process.env.MAILCHIMP_API_KEY;

  return new Promise((resolve, reject) => {
    request(
      {
        method,
        uri: `${ROOT_URI}${path}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(`apikey:${API_KEY}`).toString('base64')}`,
        },
        json: true,
        body: data,
      },
      (err, _, body) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      },
    );
  });
}

async function getMemberDetail({ email, listName }) {
  const hash = crypto.createHash('md5');

  const path = `/lists/${LIST_IDS[listName]}/members/${hash.update(email).digest('hex')}`;

  const res = await callAPI({ path, method: 'GET' });

  return res;
}

export async function subscribe({ email, listName, book }) {
  const data: any = {
    email_address: email,
    status: 'subscribed',
  };

  if (book) {
    data.merge_fields = {
      BOOK: book,
    };
  }

  const path = `/lists/${LIST_IDS[listName]}/members/`;

  let res: any = await callAPI({ path, method: 'POST', data });
  if (res.id || !book) {
    return;
  }

  res = await getMemberDetail({ email, listName });
  const {
    merge_fields: { BOOK = '' },
  } = res;

  if (BOOK.includes(book)) {
    return;
  }

  const books = BOOK.split(',')
    .map(b => b.trim())
    .filter(b => !!b);

  books.push(book);

  const hash = crypto.createHash('md5');

  await callAPI({
    path: `${path}${hash.update(email).digest('hex')}`,
    method: 'PUT',
    data: { merge_fields: { BOOK: books.join(', ') } },
  });
}
