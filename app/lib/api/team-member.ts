import sendRequestAndGetResponse from './sendRequestAndGetResponse';

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

export const getTopicList = (teamId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/topics/list`, {
    method: 'GET',
    qs: { teamId },
  });

export const getDiscussionList = (
  params,
): Promise<{
  discussions: Array<any>;
  totalCount: number;
}> =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/list`, {
    method: 'GET',
    qs: params,
  });

export const getTeamList = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams`, {
    method: 'GET',
  });

export const addDiscussion = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/add`, {
    body: JSON.stringify(data),
  });

export const editDiscussion = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/edit`, {
    body: JSON.stringify(data),
  });

export const deleteDiscussion = (discussionId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/delete`, {
    body: JSON.stringify({ discussionId }),
  });
export const toggleDiscussionPin = ({ id, isPinned }: { id: string; isPinned: boolean }) =>
  sendRequestAndGetResponse(`${BASE_PATH}/discussions/toggle-pin`, {
    body: JSON.stringify({ id, isPinned }),
  });

export const getPostList = (discussionId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/list`, {
    method: 'GET',
    qs: { discussionId },
  });

export const addPost = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/add`, {
    body: JSON.stringify(data),
  });

export const editPost = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/edit`, {
    body: JSON.stringify(data),
  });

export const deletePost = (id: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/delete`, {
    body: JSON.stringify({ id }),
  });

// Uploading file to S3

export const getSignedRequestForUpload = (file, prefix) =>
  sendRequestAndGetResponse(`${BASE_PATH}/posts/get-signed-request-for-upload-to-s3`, {
    method: 'GET',
    qs: { fileName: file.name, fileType: file.type, prefix: prefix },
  });

export const uploadFileUsingSignedPutRequest = (file, signedRequest) =>
  sendRequestAndGetResponse(signedRequest, {
    externalServer: true,
    method: 'PUT',
    body: file,
  });