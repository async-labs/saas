import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/admin';

export const removeOldData = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-old-data`, {
    method: 'GET',
  });

export const getUser = (options = {}) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-user`,
    Object.assign(
      {
        method: 'GET',
      },
      options,
    ),
  );

export const getInitialData = (options: any = {}) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-initial-data`,
    Object.assign(
      {
        body: JSON.stringify(options.data || {}),
      },
      options,
    ),
  );
