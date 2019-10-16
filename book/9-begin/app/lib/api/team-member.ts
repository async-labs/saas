import sendRequestAndGetResponse from './sendRequestAndGetResponse';

// 14
// import { LAMBDA_API_ENDPOINT } from '../consts';

const BASE_PATH = '/api/v1/team-member';

export const getInitialData = (options: any = {}) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-initial-data`,
    Object.assign(
      {
        body: JSON.stringify(options.data || {}),
      },
      options,
    ),
  );

// 10
// export const getTeamList = () =>
//   sendRequestAndGetResponse(`${BASE_PATH}/teams`, {
//     method: 'GET',
//   });

// 12
// export const getDiscussionList = (params): Promise<{ discussions: any[] }> =>
//   sendRequestAndGetResponse(`${BASE_PATH}/discussions/list`, {
//     method: 'GET',
//     qs: params,
//   });

// export const addDiscussion = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/discussions/add`, {
//     body: JSON.stringify(data),
//   });

// export const editDiscussion = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/discussions/edit`, {
//     body: JSON.stringify(data),
//   });

// export const deleteDiscussion = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/discussions/delete`, {
//     body: JSON.stringify(data),
//   });

// export const getPostList = (discussionId: string) =>
//   sendRequestAndGetResponse(`${BASE_PATH}/posts/list`, {
//     method: 'GET',
//     qs: { discussionId },
//   });

// export const addPost = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/posts/add`, {
//     body: JSON.stringify(data),
//   });

// export const editPost = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/posts/edit`, {
//     body: JSON.stringify(data),
//   });

// export const deletePost = data =>
//   sendRequestAndGetResponse(`${BASE_PATH}/posts/delete`, {
//     body: JSON.stringify(data),
//   });

// Uploading file to S3

export const getSignedRequestForUpload = ({ file, prefix, bucket, acl = 'public-read' }) =>
  sendRequestAndGetResponse(`${BASE_PATH}/aws/get-signed-request-for-upload-to-s3`, {
    body: JSON.stringify({ fileName: file.name, fileType: file.type, prefix, bucket, acl }),
  });

export const uploadFileUsingSignedPutRequest = (file, signedRequest, headers = {}) =>
  sendRequestAndGetResponse(signedRequest, {
    externalServer: true,
    method: 'PUT',
    body: file,
    headers,
  });

export const updateProfile = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/update-profile`, {
    body: JSON.stringify(data),
  });

export const toggleTheme = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/toggle-theme`, {
    body: JSON.stringify(data),
  });

// 14
// export const sendDataToLambda = data =>
//   sendRequestAndGetResponse(`${LAMBDA_API_ENDPOINT}/`, {
//     externalServer: true,
//     body: JSON.stringify(data),
//   });
