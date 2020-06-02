import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/team-leader';

export const addTeamApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/add`, {
    body: JSON.stringify(data),
  });

export const updateTeamApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/update`, {
    body: JSON.stringify(data),
  });

export const getTeamMembersApiMethod = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/get-members`, {
    method: 'GET',
    qs: { teamId },
  });

export const getTeamInvitedUsersApiMethod = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/get-invited-users`, {
    method: 'GET',
    qs: { teamId },
  });

export const inviteMemberApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/invite-member`, {
    body: JSON.stringify(data),
  });

export const removeMemberApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-member`, {
    body: JSON.stringify(data),
  });
