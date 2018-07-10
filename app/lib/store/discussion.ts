import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import NProgress from 'nprogress';

import { addPost, deletePost, editDiscussion, getPostList } from '../api/team-member';
import { Post, Store, Team } from './index';

class Discussion {
  public _id: string;
  public createdUserId: string;
  public store: Store;
  public team: Team;

  public name: string;
  public slug: string;
  public memberIds: IObservableArray<string> = observable([]);
  public posts: IObservableArray<Post> = observable([]);

  public isLoadingPosts = false;

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

  public setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));

    this.posts.replace(postObjs);
  }

  public async loadPosts() {
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

  public changeLocalCache(data) {
    // TODO: remove if current user no longer access to this discussion

    this.name = data.name;
    this.memberIds.replace(data.memberIds || []);
  }

  public async edit(data) {
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

  public addPostToLocalCache(data) {
    const postObj = new Post({ discussion: this, store: this.store, ...data });
    this.posts.push(postObj);
  }

  public editPostFromLocalCache(data) {
    const post = this.posts.find(t => t._id === data.id);
    post.changeLocalCache(data);
  }

  public removePostFromLocalCache(postId) {
    const post = this.posts.find(t => t._id === postId);
    this.posts.remove(post);
  }

  public async addPost(content: string) {
    const { post } = await addPost({
      discussionId: this._id,
      content,
    });

    runInAction(() => {
      this.addPostToLocalCache(post);
    });
  }

  public async deletePost(post: Post) {
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
