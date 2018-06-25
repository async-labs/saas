import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/admin';

export const removeOldData = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-old-data`, {
    method: 'GET',
  });