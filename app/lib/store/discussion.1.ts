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
  lastActivityDate: Date = new Date();

  isLoadingPosts = false;

  constructor(params) {
    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.store = params.store;
    this.team = params.team;

    this.name = params.name;
    this.slug = params.slug;
    this.memberIds.replace(params.memberIds || []);

    if (params.lastActivityDate) {
      params.lastActivityDate = new Date(params.lastActivityDate);
    }

    this.lastActivityDate = params.lastActivityDate;

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
      const lastPostId = this.posts.length > 0 ? this.posts[this.posts.length - 1]._id : null;
      const { posts = [] } = await getPostList(this._id, lastPostId);

      runInAction(() => {
        posts.forEach(t =>
          this.posts.push(new Post({ discussion: this, store: this.store, ...t })),
        );
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
        socketId: (this.store.socket && this.store.socket.id) || null,
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
      socketId: (this.store.socket && this.store.socket.id) || null,
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
      socketId: (this.store.socket && this.store.socket.id) || null,
    });

    runInAction(() => {
      this.posts.remove(post);
    });
  }

  leaveSocketRoom() {
    if (this.store.socket) {
      console.log('leaving socket discussion room', this.name);
      this.store.socket.emit('leaveDiscussion', this._id);
    }
  }

  joinSocketRoom() {
    if (this.store.socket) {
      console.log('joining socket discussion room', this.name);
      this.store.socket.emit('joinDiscussion', this._id);
    }
  }
}

decorate(Discussion, {
  name: observable,
  slug: observable,
  memberIds: observable,
  posts: observable,
  isLoadingPosts: observable,
  lastActivityDate: observable,

  setInitialPosts: action,
  loadPosts: action,
  changeLocalCache: action,
  edit: action,
  handlePostRealtimeEvent: action,
  addPostToLocalCache: action,
  editPostFromLocalCache: action,
  removePostFromLocalCache: action,
  addPost: action,
  deletePost: action,
});

export { Discussion };
