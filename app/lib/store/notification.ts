export class Notification {
  _id: string;
  content: String;
  createdAt: Date;

  discussionId: String;
  topicId: String;

  isDeleting = false;

  constructor(params) {
    Object.assign(this, params);
  }
}
