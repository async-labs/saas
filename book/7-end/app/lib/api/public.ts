import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/public';

export const getUserApiMethod = (opts = {}) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-user`,
    Object.assign(
      {
        method: 'GET',
      },
      opts,
    ),
  );

export const getUserBySlugApiMethod = (slug) =>
  sendRequestAndGetResponse(`${BASE_PATH}/get-user-by-slug`, {
    body: JSON.stringify({ slug }),
  });

export const emailLoginLinkApiMethod = ({
  email,
  next,
  invitationToken,
}: {
  email: string;
  next?: string;
  invitationToken?: string;
}) =>
  sendRequestAndGetResponse('/auth/email-login-link', {
    qs: { next, invitationToken },
    body: JSON.stringify({ user: email }),
  });

export const acceptAndGetInvitedTeamByToken = (token: string, request) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/accept-and-get-team-by-token`, {
    request,
    method: 'GET',
    qs: { token },
  });

export const removeInvitationIfMemberAdded = (token: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/remove-invitation-if-member-added`, {
    body: JSON.stringify({ token }),
  });