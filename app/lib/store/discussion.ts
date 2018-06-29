import { observable, action, IObservableArray, runInAction, decorate } from 'mobx';

import { getPostList, editDiscussion, addPost, deletePost } from '../api/team-member';

import { Store, Topic, Post } from './index';

class Discussion {
  _id: string;
  topicId: string;
  store: Store;
  topic: Topic;

  name: string;
  slug: string;
  isPrivate: boolean;
  memberIds: IObservableArray<string> = observable([]);
  posts: IObservableArray<Post> = observable([]);
  isInitialPostsLoaded = false;
  lastActivityDate: Date = new Date();

  private isLoadingPosts = false;

  constructor(params) {
    this._id = params._id;
    this.topicId = params.topicId;
    this.store = params.store;
    this.topic = params.topic;

    this.name = params.name;
    this.slug = params.slug;
    this.isPrivate = !!params.isPrivate;
    this.memberIds.replace(params.memberIds || []);

    if (params.lastActivityDate) {
      params.lastActivityDate = new Date(params.lastActivityDate);
    }

    if (params.initialPosts) {
      this.setInitialPosts(params.initialPosts);
    }
  }

  setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));

    this.posts.replace(postObjs);
    this.isInitialPostsLoaded = true;
  }

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

  changeLocalCache(data) {
    // TODO: remove if current user no longer access to this discussion

    this.name = data.name;
    this.isPrivate = !!data.isPrivate;
    this.memberIds.replace(data.memberIds || []);
  }

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

  addPostToLocalCache(data) {
    const postObj = new Post({ discussion: this, store: this.store, ...data });
    this.posts.push(postObj);
  }

  editPostFromLocalCache(data) {
    const post = this.posts.find(t => t._id === data.id);
    post.changeLocalCache(data);
  }

  removePostFromLocalCache(postId) {
    const post = this.posts.find(t => t._id === postId);
    this.posts.remove(post);
  }

  async addPost(content: string) {
    const { post } = await addPost({
      discussionId: this._id,
      content,
    });

    runInAction(() => {
      this.addPostToLocalCache(post);
    });
  }

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

decorate(Discussion, {
  name: observable,
  slug: observable,
  isPrivate: observable,
  memberIds: observable,
  posts: observable,
  isInitialPostsLoaded: observable,
  lastActivityDate: observable,

  setInitialPosts: action,
  loadInitialPosts: action,
  changeLocalCache: action,
  edit: action,
  addPostToLocalCache: action,
  editPostFromLocalCache: action,
  removePostFromLocalCache: action,
  addPost: action,
  deletePost: action,
});

export { Discussion };
