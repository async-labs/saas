import { Response } from 'express';
import * as _ from 'lodash';
import * as socketio from 'socket.io';

import { DiscussionDocument } from './models/Discussion';
import { PostDocument } from './models/Post';

let io: socketio.Server = null;

function getSocket(socketId?: string) {
  if (!io) {
    return null;
  }

  if (socketId && io.sockets.connected[socketId]) {
    // if client connected to socket broadcast to other connected sockets
    return io.sockets.connected[socketId].broadcast;
  } else {
    // if client NOT connected to socket sent to all sockets
    return io;
  }
}

function setup({ http, origin, sessionMiddleware }) {
  if (io === null) {
    io = socketio(http, {
      origins: `${origin}:443`,
      serveClient: false,
    });

    io.use((socket, next) => sessionMiddleware(socket.request, {} as Response, next))
      .use((socket, next) => {
        console.log(`Socket middleware - ID: ${socket.id}`);
        next();
      })
      .on('connection', (socket) => {
        if (
          !socket.request.session ||
          !socket.request.session.passport ||
          !socket.request.session.passport.user
        ) {
          // user is not logged in so disconnect socket
          socket.disconnect();
          return;
        }

        const userId = socket.request.session.passport.user;

        console.log(`Connected to socket => Your User ID is: ${userId}`);

        socket.join(`user-${userId}`);

        socket.on('joinDiscussion', (discussionId) => {
          console.log(`    joinDiscussion ${discussionId}`);
          socket.join(`discussion-${discussionId}`);
        });

        socket.on('leaveDiscussion', (discussionId) => {
          console.log(`** leaveDiscussion ${discussionId}`);
          socket.leave(`discussion-${discussionId}`);
        });

        socket.on('disconnect', () => {
          console.log(`disconnected => Your User ID is: ${userId}`);
        });
      });
  }
}

function discussionAdded({
  socketId,
  discussion,
}: {
  socketId?: string;
  discussion: DiscussionDocument;
}) {
  const roomName = `team-${discussion.teamId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('discussionEvent', { action: 'added', discussion });
  }
}

function discussionEdited({
  socketId,
  discussion,
}: {
  socketId?: string;
  discussion: DiscussionDocument;
}) {
  const roomName = `team-${discussion.teamId}`;
  const socket = getSocket(socketId);

  if (socket) {
    socket.to(roomName).emit('discussionEvent', {
      action: 'edited',
      discussion,
    });
  }
}

function discussionDeleted({
  socketId,
  teamId,
  id,
}: {
  socketId?: string;
  teamId: string;
  id: string;
}) {
  const roomName = `team-${teamId}`;
  const socket = getSocket(socketId);

  if (socket) {
    socket.to(roomName).emit('discussionEvent', { action: 'deleted', id });
  }
}

function postAdded({ socketId, post }: { socketId?: string; post: PostDocument }) {
  // Emit "postEvent" event to discussion's room
  const roomName = `discussion-${post.discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { action: 'added', post });
  }
}

function postEdited({ socketId, post }: { socketId?: string; post: PostDocument }) {
  // Emit "postEvent" event to discussion's room
  const roomName = `discussion-${post.discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { action: 'edited', post });
  }
}

function postDeleted({
  socketId,
  id,
  discussionId,
}: {
  socketId?: string;
  id: string;
  discussionId: string;
}) {
  // Emit "postEvent" event to discussion's room
  const roomName = `discussion-${discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { action: 'deleted', id });
  }
}

export {
  setup,
  postAdded,
  postEdited,
  postDeleted,
  discussionAdded,
  discussionEdited,
  discussionDeleted,
};
