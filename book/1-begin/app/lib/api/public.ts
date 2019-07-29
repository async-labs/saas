// 4
// import sendRequestAndGetResponse from './sendRequestAndGetResponse';

// const BASE_PATH = '/api/v1/public';

// export const getUser = (options = {}) =>
//   sendRequestAndGetResponse(
//     `${BASE_PATH}/get-user`,
//     Object.assign(
//       {
//         method: 'GET',
//       },
//       options,
//     ),
//   );

// // 10
// // export const getInvitedTeamByToken = (token: string) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/invitations/get-team-by-token`, {
// //     method: 'GET',
// //     qs: { token },
// //   });

// // export const removeInvitationIfMemberAdded = (token: string) =>
// //   sendRequestAndGetResponse(`${BASE_PATH}/invitations/remove-invitation-if-member-added`, {
// //     body: JSON.stringify({ token }),
// //   });

// // 9
// // export const sendLoginToken = (email: string) =>
// //   sendRequestAndGetResponse('/auth/send-token', {
// //     body: JSON.stringify({ email }),
// //   });
