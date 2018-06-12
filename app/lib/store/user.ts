import { observable, IObservableArray, action, runInAction } from 'mobx';

export class User {
  _id: string;
  isAdmin: boolean;
  @observable slug: string;
  @observable email: string | null;
  @observable displayName: string | null;
  @observable avatarUrl: string | null;
  @observable isGithubConnected: boolean;

  @observable starredDiscussionIds: IObservableArray<string> = <IObservableArray>[];

  constructor(params) {
    Object.assign(this, params);
  }
}
