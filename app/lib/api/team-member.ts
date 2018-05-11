import sendRequestAndGetResponse from './sendRequestAndGetResponse';

const BASE_PATH = '/api/v1/team-member';

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

export const getMessageList = (discussionId: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/messages/list`, {
    method: 'GET',
    qs: { discussionId },
  });

export const addMessage = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/messages/add`, {
    body: JSON.stringify(data),
  });

export const editMessage = data =>
  sendRequestAndGetResponse(`${BASE_PATH}/messages/edit`, {
    body: JSON.stringify(data),
  });

export const deleteMessage = (id: string) =>
  sendRequestAndGetResponse(`${BASE_PATH}/messages/delete`, {
    body: JSON.stringify({ id }),
  });

export const getNotificationList = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/notifications/list`, {
    method: 'GET',
  });

export const deleteNotifications = (ids: string[]) =>
  sendRequestAndGetResponse(`${BASE_PATH}/notifications/bulk-delete`, {
    body: JSON.stringify({ ids }),
  });
