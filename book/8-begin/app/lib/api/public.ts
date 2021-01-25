import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/public';

export const getUserApiMethod = (request) =>
  sendRequestAndGetResponse(`${BASE_PATH}/get-user`, {
    request,
    method: 'GET',
  });

export const getUserBySlugApiMethod = (slug) =>
  sendRequestAndGetResponse(`${BASE_PATH}/get-user-by-slug`, {
    body: JSON.stringify({ slug }),
  });

export const emailLoginLinkApiMethod = ({
  email,
  invitationToken,
}: {
  email: string;
  invitationToken?: string;
}) =>
  sendRequestAndGetResponse('/auth/email-login-link', {
    qs: { invitationToken },
    body: JSON.stringify({ user: email }),
  });

export const acceptAndGetInvitedTeamByTokenApiMethod = (token: string, request) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/accept-and-get-team-by-token`, {
    request,
    method: 'GET',
    qs: { token },
  });

export const removeInvitationIfMemberAddedApiMethod = (token: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/invitations/remove-invitation-if-member-added`, {
    body: JSON.stringify({ token }),
  });
