import { action, decorate, IObservableArray, observable, runInAction, computed } from 'mobx';
// import NProgress from 'nprogress';

import {
  // addPostApiMethod,
  // deletePostApiMethod,
  editDiscussionApiMethod,
  // getPostListApiMethod,
} from '../api/team-member';
import { Store } from './index';
import { Team } from './team';
// import { Post } from './post';

class Discussion {
  public _id: string;
  public createdUserId: string;
  public store: Store;
  public team: Team;

  public name: string;
  public slug: string;
  public memberIds: IObservableArray<string> = observable([]);
  // public posts: IObservableArray<Post> = observable([]);

  // public isLoadingPosts = false;

  constructor(params) {
    this._id = params._id;
    this.createdUserId = params.createdUserId;
    this.store = params.store;
    this.team = params.team;

    this.name = params.name;
    this.slug = params.slug;
    this.memberIds.replace(params.memberIds || []);

    // if (params.initialPosts) {
    //   this.setInitialPosts(params.initialPosts);
    // }
  }

  public async editDiscussion(data) {
    try {
      await editDiscussionApiMethod({
        id: this._id,
        ...data,
        // socketId: (this.store.socket && this.store.socket.id) || null,
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

  public members() {
    return this.memberIds.map((id) => this.team.members.get(id)).filter((u) => !!u);
  }

  // public setInitialPosts(posts) {
  //   const postObjs = posts.map((t) => new Post({ discussion: this, store: this.store, ...t }));
  //   this.posts.replace(postObjs);
  // }

  // public async loadPosts() {
  //   if (this.isLoadingPosts || this.store.isServer) {
  //     return;
  //   }

  //   NProgress.start();
  //   this.isLoadingPosts = true;

  //   try {
  //     const { posts = [] } = await getPostListApiMethod(this._id);

  //     runInAction(() => {
  //       const postObjs = posts.map((t) => new Post({ discussion: this, store: this.store, ...t }));
  //       this.posts.replace(postObjs);
  //     });
  //   } finally {
  //     runInAction(() => {
  //       this.isLoadingPosts = false;
  //       NProgress.done();
  //     });
  //   }
  // }

  // public async addPost(content: string): Promise<Post> {
  //   console.log(this.store.socket);
  //   console.log(this.store.socket.id);

  //   const { post } = await addPostApiMethod({
  //     discussionId: this._id,
  //     content,
  //     socketId: (this.store.socket && this.store.socket.id) || null,
  //   });

  //   return new Promise<Post>((resolve) => {
  //     runInAction(() => {
  //       const obj = this.addPostToLocalCache(post);
  //       resolve(obj);
  //     });
  //   });
  // }

  // public async deletePost(post: Post) {
  //   await deletePostApiMethod({
  //     id: post._id,
  //     discussionId: this._id,
  //     socketId: (this.store.socket && this.store.socket.id) || null,
  //   });

  //   runInAction(() => {
  //     this.posts.remove(post);
  //   });
  // }

  // public handleDiscussionRealtimeEvent = (data) => {
  //   console.log('discussion realtime event', data);
  //   const { action: actionName } = data;

  //   if (actionName === 'added') {
  //     this.addDiscussionToLocalCache(data.discussion);
  //   } else if (actionName === 'edited') {
  //     this.editDiscussionFromLocalCache(data.discussion);
  //   } else if (actionName === 'deleted') {
  //     this.removeDiscussionFromLocalCache(data.id);
  //   }
  // };

  //   public addDiscussionToLocalCache(data): Discussion {
  //   const obj = new Discussion({ team: this.team, store: this.store, ...data });

  //   if (obj.memberIds.includes(this.store.currentUser._id)) {
  //     this.team.discussions.push(obj);
  //   }

  //   return obj;
  // }

  // public editDiscussionFromLocalCache(data) {
  //   const discussion = this.team.discussions.find((item) => item._id === data._id);
  //   if (discussion) {
  //     if (data.memberIds && data.memberIds.includes(this.store.currentUser._id)) {
  //       discussion.changeLocalCache(data);
  //     } else {
  //       this.removeDiscussionFromLocalCache(data._id);
  //     }
  //   } else if (data.memberIds && data.memberIds.includes(this.store.currentUser._id)) {
  //     this.addDiscussionToLocalCache(data);
  //   }
  // }

  // public removeDiscussionFromLocalCache(discussionId: string) {
  //   const discussion = this.team.discussions.find((item) => item._id === discussionId);
  //   this.team.discussions.remove(discussion);
  // }

  // public handlePostRealtimeEvent(data) {
  //   const { action: actionName } = data;

  //   if (actionName === 'added') {
  //     this.addPostToLocalCache(data.post);
  //   } else if (actionName === 'edited') {
  //     this.editPostFromLocalCache(data.post);
  //   } else if (actionName === 'deleted') {
  //     this.removePostFromLocalCache(data.id);
  //   }
  // }

  //   public addPostToLocalCache(data) {
  //   const oldPost = this.posts.find((t) => t._id === data._id);
  //   if (oldPost) {
  //     this.posts.remove(oldPost);
  //   }

  //   const postObj = new Post({ discussion: this, store: this.store, ...data });

  //   this.posts.push(postObj);

  //   return postObj;
  // }

  // public editPostFromLocalCache(data) {
  //   const post = this.posts.find((t) => t._id === data._id);
  //   if (post) {
  //     post.changeLocalCache(data);
  //   }
  // }

  // public removePostFromLocalCache(postId) {
  //   const post = this.posts.find((t) => t._id === postId);
  //   this.posts.remove(post);
  // }

  // public joinSocketRoom() {
  //   if (this.store.socket) {
  //     console.log('joining socket discussion room', this.name);
  //     this.store.socket.emit('joinDiscussion', this._id);
  //   }
  // }

  // public leaveSocketRoom() {
  //   if (this.store.socket) {
  //     console.log('leaving socket discussion room', this.name);
  //     this.store.socket.emit('leaveDiscussion', this._id);
  //   }
  // }
}

decorate(Discussion, {
  name: observable,
  slug: observable,
  memberIds: observable,
  // posts: observable,
  // isLoadingPosts: observable,
  
  editDiscussion: action,
  changeLocalCache: action,
  // addDiscussionToLocalCache: action,
  // editDiscussionFromLocalCache: action,
  // removeDiscussionFromLocalCache: action,

  // setInitialPosts: action,
  // loadPosts: action,
  // addPost: action,
  // deletePost: action,
  // addPostToLocalCache: action,
  // editPostFromLocalCache: action,
  // removePostFromLocalCache: action,

  members: computed,
});

export { Discussion };
