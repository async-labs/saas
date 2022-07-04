import { action, IObservableArray, observable, runInAction, computed, makeObservable } from 'mobx';

import {
  addPostApiMethod,
  deletePostApiMethod,
  editDiscussionApiMethod,
  getPostListApiMethod,
  sendDataToLambdaApiMethod,
} from '../api/team-member';
import { Store } from './index';
import { Team } from './team';
import { Post } from './post';

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
    makeObservable(this, {
      name: observable,
      slug: observable,
      memberIds: observable,
      posts: observable,
      isLoadingPosts: observable,

      editDiscussion: action,
      changeLocalCache: action,

      setInitialPosts: action,
      loadPosts: action,
      addPost: action,
      addPostToLocalCache: action,
      deletePost: action,

      addDiscussionToLocalCache: action,
      editDiscussionFromLocalCache: action,
      deleteDiscussionFromLocalCache: action,
      editPostFromLocalCache: action,
      deletePostFromLocalCache: action,

      members: computed,
    });

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
      // console.log(params.initialPosts[0]);
    } else {
      this.loadPosts();
    }
  }

  public async editDiscussion(data) {
    try {
      await editDiscussionApiMethod({
        id: this._id,
        ...data,
        socketId: (this.store.socket && this.store.socket.id) || null,
      });

      runInAction(() => {
        this.changeLocalCache(data);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public changeLocalCache(data) {
    this.name = data.name;
    this.memberIds.replace(data.memberIds || []);
  }

  get members() {
    return this.memberIds.map((id) => this.team.members.get(id)).filter((u) => !!u);
  }

  public setInitialPosts(posts) {
    const postObjs = posts.map((p) => new Post({ discussion: this, store: this.store, ...p }));
    this.posts.replace(postObjs);
  }

  public async loadPosts() {
    if (this.store.isServer || this.isLoadingPosts) {
      return;
    }

    this.isLoadingPosts = true;

    try {
      const { posts = [] } = await getPostListApiMethod(this._id);

      runInAction(() => {
        const postObjs = posts.map((t) => new Post({ discussion: this, store: this.store, ...t }));
        this.posts.replace(postObjs);
      });
    } finally {
      runInAction(() => {
        this.isLoadingPosts = false;
      });
    }
  }

  public async addPost(content: string): Promise<Post> {
    const { post } = await addPostApiMethod({
      discussionId: this._id,
      content,
      socketId: (this.store.socket && this.store.socket.id) || null,
    });

    return new Promise<Post>((resolve) => {
      runInAction(() => {
        const obj = this.addPostToLocalCache(post);
        resolve(obj);
      });
    });
  }

  public addPostToLocalCache(data) {
    const postObj = new Post({ discussion: this, store: this.store, ...data });

    this.posts.push(postObj);

    return postObj;
  }

  public async deletePost(post: Post) {
    await deletePostApiMethod({
      id: post._id,
      discussionId: this._id,
      socketId: (this.store.socket && this.store.socket.id) || null,
    });

    runInAction(() => {
      this.posts.remove(post);
    });
  }

  public joinSocketRooms() {
    if (this.store.socket) {
      console.log('joining socket discussion room', this.name);
      this.store.socket.emit('joinTeamRoom', this.team._id);
      this.store.socket.emit('joinDiscussionRoom', this._id);
    }
  }

  public leaveSocketRooms() {
    if (this.store.socket) {
      console.log('leaving socket discussion room', this.name);
      this.store.socket.emit('leaveTeamRoom', this.team._id);
      this.store.socket.emit('leaveDiscussionRoom', this._id);
    }
  }

  public handleDiscussionRealtimeEvent = (data) => {
    console.log('discussion realtime event', data);
    const { actionType } = data;

    if (actionType === 'added') {
      this.addDiscussionToLocalCache(data.discussion);
    } else if (actionType === 'edited') {
      this.editDiscussionFromLocalCache(data.discussion);
    } else if (actionType === 'deleted') {
      this.deleteDiscussionFromLocalCache(data.id);
    }
  };

  public addDiscussionToLocalCache(data): Discussion {
    const obj = new Discussion({ team: this.team, store: this.store, ...data });

    if (obj.memberIds.includes(this.store.currentUser._id)) {
      this.team.discussions.push(obj);
    }

    return obj;
  }

  public editDiscussionFromLocalCache(data) {
    const discussion = this.team.discussions.find((item) => item._id === data._id);
    if (discussion) {
      if (data.memberIds && data.memberIds.includes(this.store.currentUser._id)) {
        discussion.changeLocalCache(data);
      } else {
        this.deleteDiscussionFromLocalCache(data._id);
      }
    } else if (data.memberIds && data.memberIds.includes(this.store.currentUser._id)) {
      this.addDiscussionToLocalCache(data);
    }
  }

  public deleteDiscussionFromLocalCache(discussionId: string) {
    const discussion = this.team.discussions.find((item) => item._id === discussionId);
    this.team.discussions.remove(discussion);
  }

  public handlePostRealtimeEvent(data) {
    const { actionType } = data;

    if (actionType === 'added') {
      this.addPostToLocalCache(data.post);
    } else if (actionType === 'edited') {
      this.editPostFromLocalCache(data.post);
    } else if (actionType === 'deleted') {
      this.deletePostFromLocalCache(data.id);
    }
  }

  public editPostFromLocalCache(data) {
    const post = this.posts.find((t) => t._id === data._id);
    if (post) {
      post.changeLocalCache(data);
    }
  }

  public deletePostFromLocalCache(postId) {
    const post = this.posts.find((t) => t._id === postId);
    this.posts.remove(post);
  }

  public async sendDataToLambda({
    discussionName,
    discussionLink,
    postContent,
    authorName,
    userIds,
  }) {
    console.log(discussionName, discussionLink, authorName, postContent, userIds);
    try {
      await sendDataToLambdaApiMethod({
        discussionName,
        discussionLink,
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

export { Discussion };
