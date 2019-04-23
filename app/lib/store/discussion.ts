import { action, decorate, IObservableArray, observable, runInAction } from 'mobx';
import NProgress from 'nprogress';

import {
  addPost,
  deletePost,
  editDiscussion,
  getPostList,
  sendDataToLambda,
} from '../api/team-member';
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
  public notificationType: string;

  constructor(params) {
    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.store = params.store;
    this.team = params.team;

    this.name = params.name;
    this.slug = params.slug;
    this.memberIds.replace(params.memberIds || []);
    this.notificationType = params.notificationType;

    if (params.initialPosts) {
      this.setInitialPosts(params.initialPosts);
    }
  }

  get members() {
    return this.memberIds.map(id => this.team.members.get(id)).filter(u => !!u);
  }

  public setInitialPosts(posts) {
    const postObjs = posts.map(t => new Post({ discussion: this, store: this.store, ...t }));
    this.posts.replace(postObjs.filter(p => p.createdUserId === this.store.currentUser._id));
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
        this.posts.replace(postObjs.filter(p => p.createdUserId === this.store.currentUser._id));
      });
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
    this.notificationType = data.notificationType;
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
    const oldPost = this.posts.find(t => t._id === data._id);
    if (oldPost) {
      this.posts.remove(oldPost);
    }

    const postObj = new Post({ discussion: this, store: this.store, ...data });

    if (postObj.createdUserId !== this.store.currentUser._id) {
      return;
    }

    this.posts.push(postObj);

    return postObj;
  }

  public editPostFromLocalCache(data) {
    const post = this.posts.find(t => t._id === data._id);
    if (post) {
      post.changeLocalCache(data);
    }
  }

  public removePostFromLocalCache(postId) {
    const post = this.posts.find(t => t._id === postId);
    this.posts.remove(post);
  }

  public async addPost(content: string): Promise<Post> {
    const { post } = await addPost({
      discussionId: this._id,
      content,
    });

    return new Promise<Post>(resolve => {
      runInAction(() => {
        const obj = this.addPostToLocalCache(post);
        resolve(obj);
      });
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

  public async sendDataToLambdaApiMethod({ discussionName, postContent, authorName, userIds }) {
    console.log(discussionName, authorName, postContent, userIds);
    try {
      await sendDataToLambda({
        discussionName,
        postContent,
        authorName,
        userIds,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

decorate(Discussion, {
  name: observable,
  slug: observable,
  memberIds: observable,
  posts: observable,
  isLoadingPosts: observable,
  notificationType: observable,

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
