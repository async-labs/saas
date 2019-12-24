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

export const acceptAndGetInvitedTeamByToken = (token: string, request) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/get-team-by-token`, {
    request,
    method: 'GET',
    qs: { token },
  });

export const removeInvitationIfMemberAdded = (token: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/remove-invitation-if-member-added`, {
    body: JSON.stringify({ token }),
  });

export const sendLoginToken = ({
  email,
  next,
  invitationToken,
}: {
  email: string;
  next?: string;
  invitationToken?: string;
}) =>
  sendRequestAndGetResponse('/auth/send-token', {
    qs: { next, invitationToken },
    body: JSON.stringify({ email }),
  });
