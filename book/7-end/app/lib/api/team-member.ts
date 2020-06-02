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