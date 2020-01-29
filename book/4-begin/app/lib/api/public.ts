import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/public';

export const getUser = (request) =>
  sendRequestAndGetResponse(`${BASE_PATH}/get-user`, {
    request,
    method: 'GET',
  });
