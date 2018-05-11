import { observable, action, IObservableArray, runInAction } from 'mobx';

import { getMessageList, editDiscussion, addMessage, deleteMessage } from '../api/team-member';

import { Message } from './message';

export class Discussion {
  _id: string;
  topicId: string;

  @observable isPinned = false;
  @observable name: string;
  @observable slug: string;
  @observable memberIds: IObservableArray<string> = <IObservableArray>[];
  @observable messages: IObservableArray<Message> = <IObservableArray>[];
  @observable isInitialMessagesLoaded = false;

  @observable private isLoadingMessages = false;

  constructor(params) {
    Object.assign(this, params);
  }

  @action
  async loadMessages() {
    if (this.isLoadingMessages) {
      return;
    }

    this.isLoadingMessages = true;

    try {
      const { messages = [] } = await getMessageList(this._id);
      const messageObjs = messages.map(t => new Message({ discussion: this, ...t }));

      runInAction(() => {
        this.messages.replace(messageObjs);
        this.isLoadingMessages = false;
        this.isInitialMessagesLoaded = true;
      });
    } catch (error) {
      console.error(error);
      runInAction(() => {
        this.isLoadingMessages = false;
      });

      throw error;
    }
  }

  @action
  async edit(data) {
    try {
      await editDiscussion({ id: this._id, ...data });

      runInAction(() => {
        this.name = data.name;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @action
  async addMessage(data) {
    const { message } = await addMessage({ discussionId: this._id, ...data });
    const messageObj = new Message(message);

    runInAction(() => {
      this.messages.push(messageObj);
    });
  }

  @action
  async deleteMessage(message: Message) {
    await deleteMessage(message._id);

    runInAction(() => {
      this.messages.remove(message);
    });
  }
}
