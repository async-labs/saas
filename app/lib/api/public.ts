import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/public';

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

export const getInvitedTeamByToken = (token: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/get-team-by-token`, {
    method: 'GET',
    qs: { token },
  });
