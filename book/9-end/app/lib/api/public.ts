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

// 10
// export const acceptAndGetInvitedTeamByToken = (token: string, request) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/invitations/get-team-by-token`, {
//     request,
//     method: 'GET',
//     qs: { token },
//   });

// export const removeInvitationIfMemberAdded = (token: string) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/invitations/remove-invitation-if-member-added`, {
//     body: JSON.stringify({ token }),
//   });

// 10
// export const sendLoginToken = ({
//   email,
//   next,
//   invitationToken,
// }: {
//   email: string;
//   next?: string;
//   invitationToken?: string;
// }) =>
export const sendLoginToken = (email: string) =>
  sendRequestAndGetResponse('/auth/send-token', {
    // 10
    // qs: { next, invitationToken },
    body: JSON.stringify({ email }),
  });
