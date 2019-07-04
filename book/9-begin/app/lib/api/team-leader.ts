// 10
// import sendRequestAndGetResponse from './sendRequestAndGetResponse';

// const BASE_PATH = '/api/v1/team-leader';

// export const addTeam = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/add`, {
//   body: JSON.stringify(data),
// });

// export const updateTeam = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/update`, {
//   body: JSON.stringify(data),
// });

// export const getTeamMembers = (teamId: string) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/get-members`, {
//   method: 'GET',
//   qs: { teamId },
// });

// export const getTeamInvitedUsers = (teamId: string) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/get-invited-users`, {
//   method: 'GET',
//   qs: { teamId },
// });

// export const inviteMember = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/invite-member`, {
//   body: JSON.stringify(data),
// });

// export const removeMember = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-member`, {
//   body: JSON.stringify(data),
// });

// // 11
// // export const createSubscriptionApiMethod = ({ teamId }: { teamId: string }) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/subscribe-team`, {
// //   body: JSON.stringify({ teamId }),
// // });

// // export const cancelSubscriptionApiMethod = ({ teamId }: { teamId: string }) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/cancel-subscription`, {
// //   body: JSON.stringify({ teamId }),
// // });

// // export const createCustomerApiMethod = ({ token }: { token: object }) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/create-customer`, {
// //   body: JSON.stringify({ token }),
// // });

// // export const createNewCardAndUpdateCustomerApiMethod = ({ token }: { token: object }) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/create-new-card-update-customer`, {
// //   body: JSON.stringify({ token }),
// // });

// // export const getListOfInvoices = () =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/get-list-of-invoices-for-customer`, {
// //   method: 'GET',
// // });
