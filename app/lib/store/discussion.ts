import { observable, action, IObservableArray, runInAction, decorate } from 'mobx';
import NProgress from 'nprogress';

import { getPostList, editDiscussion, addPost, deletePost } from '../api/team-member';
import { Store, Team, Post } from './index';

class Discussion {
  _id: string;
  createdUserId: string;
  store: Store;
  team: Team;

  name: string;
  slug: string;
  memberIds: IObservableArray<string> = observable([]);
  posts: IObservableArray<Post> = observable([]);

  isLoadingPosts = false;

  constructor(params) {
    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.store = params.store;
    this.team = params.team;

    this.name = params.name;
    this.slug = params.slug;
    this.memberIds.replace(params.memberIds || []);

    if (params.initialPosts) {
      this.setInitialPosts(params.initialPosts);
    }
  }

  get members() {
    return this.memberIds.map(id => this.team.members.get(id));
  }

  setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));

    this.posts.replace(postObjs);
  }

  async loadPosts() {
    if (this.isLoadingPosts || this.store.isServer) {
      return;
    }

    NProgress.start();
    this.isLoadingPosts = true;

    try {
      const { posts = [] } = await getPostList(this._id);

      runInAction(() => {
        const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));
        this.posts.replace(postObjs);
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      runInAction(() => {
        this.isLoadingPosts = false;
        NProgress.done();
      });
    }
  }

  changeLocalCache(data) {
    // TODO: remove if current user no longer access to this discussion

    this.name = data.name;
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
  memberIds: observable,
  posts: observable,
  isLoadingPosts: observable,

  setInitialPosts: action,
  loadPosts: action,
  changeLocalCache: action,
  edit: action,
  addPostToLocalCache: action,
  editPostFromLocalCache: action,
  removePostFromLocalCache: action,
  addPost: action,
  deletePost: action,
});

export { Discussion };
