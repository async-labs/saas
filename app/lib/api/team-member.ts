import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/team-member';

export const getSignedRequestForUploadApiMethod = ({ fileName, fileType, prefix, bucket }) =>
  sendRequestAndGetResponse(`${BASE_PATH}/aws/get-signed-request-for-upload-to-s3`, {
    body: JSON.stringify({ fileName, fileType, prefix, bucket }),
  });

export const uploadFileUsingSignedPutRequestApiMethod = (file, signedRequest, headers = {}) =>
  sendRequestAndGetResponse(signedRequest, {
    externalServer: true,
    method: 'PUT',
    body: file,
    headers,
  });

export const updateProfileApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/update-profile`, {
    body: JSON.stringify(data),
  });

export const toggleThemeApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/toggle-theme`, {
    body: JSON.stringify(data),
  });

export const getInitialDataApiMethod = (options: any = {}) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-initial-data`,
    Object.assign(
      {
        body: JSON.stringify(options.data || {}),
      },
      options,
    ),
  );

export const getTeamListApiMethod = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams`, {
    method: 'GET',
  });

export const getTeamMembersApiMethod = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/get-members`, {
    method: 'GET',
    qs: { teamId },
  });

// Discussion and Post

export const getDiscussionListApiMethod = (params): Promise<{ discussions: any[] }> =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/list`, {
    method: 'GET',
    qs: params,
  });

export const addDiscussionApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/add`, {
    body: JSON.stringify(data),
  });

export const editDiscussionApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/edit`, {
    body: JSON.stringify(data),
  });

export const deleteDiscussionApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/delete`, {
    body: JSON.stringify(data),
  });

export const getPostListApiMethod = (discussionId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/list`, {
    method: 'GET',
    qs: { discussionId },
  });

export const addPostApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/add`, {
    body: JSON.stringify(data),
  });

export const editPostApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/edit`, {
    body: JSON.stringify(data),
  });

export const deletePostApiMethod = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/delete`, {
    body: JSON.stringify(data),
  });

export const sendDataToLambdaApiMethod = (data) =>
  sendRequestAndGetResponse(`${process.env.API_GATEWAY_ENDPOINT}/`, {
    externalServer: true,
    body: JSON.stringify(data),
  });
