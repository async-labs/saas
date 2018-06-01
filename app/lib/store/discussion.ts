import { observable, action, IObservableArray, runInAction } from 'mobx';

import { getPostList, editDiscussion, addPost, deletePost } from '../api/team-member';

import { Post } from './post';
import { Topic } from './topic';

export class Discussion {
  _id: string;
  topicId: string;

  @observable isPinned = false;
  @observable name: string;
  @observable slug: string;
  @observable isPrivate: boolean;
  @observable memberIds: IObservableArray<string> = <IObservableArray>[];
  @observable posts: IObservableArray<Post> = <IObservableArray>[];
  @observable isInitialPostsLoaded = false;

  @observable private isLoadingPosts = false;

  topic: Topic;

  constructor(params) {
    Object.assign(this, params);

    if (params.initialPosts) {
      this.setInitialPosts(params.initialPosts);
    }
  }

  @action
  setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, ...t }));

    runInAction(() => {
      this.posts.replace(postObjs);
      this.isInitialPostsLoaded = true;
    });
  }

  @action
  async loadInitialPosts() {
    if (this.isLoadingPosts || this.isInitialPostsLoaded) {
      return;
    }

    this.isLoadingPosts = true;

    try {
      const { posts = [] } = await getPostList(this._id);
      const postObjs = posts.map(t => new Post({ discussion: this, ...t }));

      runInAction(() => {
        this.posts.replace(postObjs);
        this.isLoadingPosts = false;
        this.isInitialPostsLoaded = true;
      });
    } catch (error) {
      console.error(error);
      runInAction(() => {
        this.isLoadingPosts = false;
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
        this.isPrivate = !!data.isPrivate;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @action
  async addPost(data) {
    const { post } = await addPost({ discussionId: this._id, ...data });
    const postObj = new Post({ discussion: this, ...post });

    runInAction(() => {
      this.posts.push(postObj);
    });
  }

  @action
  async deletePost(post: Post) {
    await deletePost(post._id);

    runInAction(() => {
      this.posts.remove(post);
    });
  }
}
