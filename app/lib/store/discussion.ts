import { observable, action, IObservableArray, runInAction } from 'mobx';

import { getPostList, editDiscussion, addPost, deletePost } from '../api/team-member';

import { Store, Topic, Post } from './index';

export class Discussion {
  _id: string;
  topicId: string;
  store: Store;
  topic: Topic;

  @observable name: string;
  @observable slug: string;
  @observable isPrivate: boolean;
  @observable memberIds: IObservableArray<string> = <IObservableArray>[];
  @observable posts: IObservableArray<Post> = <IObservableArray>[];
  @observable isInitialPostsLoaded = false;
  @observable lastActivityDate: Date = new Date();

  @observable private isLoadingPosts = false;

  constructor(params) {
    if (params.lastActivityDate) {
      params.lastActivityDate = new Date(params.lastActivityDate);
    }

    Object.assign(this, params);

    if (params.initialPosts) {
      this.setInitialPosts(params.initialPosts);
    }
  }

  @action
  setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));

    this.posts.replace(postObjs);
    this.isInitialPostsLoaded = true;
  }

  @action
  async loadInitialPosts() {
    if (this.isLoadingPosts || this.isInitialPostsLoaded) {
      return;
    }

    this.isLoadingPosts = true;

    try {
      const { posts = [] } = await getPostList(this._id);

      runInAction(() => {
        this.setInitialPosts(posts);
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      runInAction(() => {
        this.isLoadingPosts = false;
      });
    }
  }

  @action
  changeLocalCache(data) {
    // TODO: remove if current user no longer access to this discussion

    this.name = data.name;
    this.isPrivate = !!data.isPrivate;
    this.memberIds.replace(data.memberIds || []);
  }

  @action
  async edit(data) {
    try {
      await editDiscussion({
        id: this._id,
        ...data,
      });

      runInAction(() => {
        this.changeLocalCache(data);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @action
  handlePostRealtimeEvent(data) {
    const { action } = data;

    if (action === 'added') {
      this.addPostToLocalCache(data.post);
    } else if (action === 'edited') {
      this.editPostFromLocalCache(data);
    } else if (action === 'deleted') {
      this.removePostFromLocalCache(data.id);
    }
  }

  @action
  addPostToLocalCache(data) {
    const postObj = new Post({ discussion: this, store: this.store, ...data });
    this.posts.push(postObj);
  }

  @action
  editPostFromLocalCache(data) {
    const post = this.posts.find(t => t._id === data.id);
    post.changeLocalCache(data);
  }

  @action
  removePostFromLocalCache(postId) {
    const post = this.posts.find(t => t._id === postId);
    this.posts.remove(post);
  }

  @action
  async addPost(data) {
    const { post } = await addPost({
      discussionId: this._id,
      ...data,
    });

    runInAction(() => {
      this.addPostToLocalCache(post);
    });
  }

  @action
  async deletePost(post: Post) {
    await deletePost({
      id: post._id,
      discussionId: this._id,
    });

    runInAction(() => {
      this.posts.remove(post);
    });
  }
}
