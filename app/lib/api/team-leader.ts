import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/team-leader';

// subscribe to $50/mo plan
// export const buyBook = ({ id, stripeToken }) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/buy-book`, {
//     body: JSON.stringify({ id, stripeToken }),
//   });

export const addTeam = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/add`, {
    body: JSON.stringify(data),
  });

export const updateTeam = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/update-team`, {
    body: JSON.stringify(data),
  });

export const getTeamMembers = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/get-members`, {
    method: 'GET',
    qs: { teamId },
  });

export const getTeamInvitedUsers = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/get-invited-users`, {
    method: 'GET',
    qs: { teamId },
  });

export const inviteMember = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/invite-member`, {
    body: JSON.stringify(data),
  });

export const removeMember = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-member`, {
    body: JSON.stringify(data),
  });

export const addTopic = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/topics/add`, {
    body: JSON.stringify(data),
  });

export const editTopic = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/topics/edit`, {
    body: JSON.stringify(data),
  });

export const deleteTopic = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/topics/delete`, {
    body: JSON.stringify(data),
  });
