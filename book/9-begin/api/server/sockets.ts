import { Response } from 'express';
import * as _ from 'lodash';
import * as socketio from 'socket.io';

import { DiscussionDocument } from './models/Discussion';
import { PostDocument } from './models/Post';

let io: socketio.Server = null;
// const dev = process.env.NODE_ENV !== 'production';

function setup({ http, origin, sessionMiddleware }) {
  if (io === null) {
    io = socketio(http, { origins: origin, serveClient: false });

    // if (dev) {
    //   io.origins(origin);
    // } else {
    //   io.origins(`${origin}:443`);
    // }

    io.use((socket, next) => sessionMiddleware(socket.request, {} as Response, next));

    io.on('connection', (socket) => {
      if (
        !socket.request.session ||
        ((!socket.request.session.passport || !socket.request.session.passport.user) &&
          !socket.request.session.passwordless)
      ) {
        socket.disconnect();
        return;
      }

      socket.on('joinTeamRoom', (teamId) => {
        console.log(`    joinTeamRoom ${teamId}`);
        socket.join(`teamRoom-${teamId}`);
      });

      socket.on('leaveTeamRoom', (teamId) => {
        console.log(`** leaveTeamRoom ${teamId}`);
        socket.leave(`teamRoom-${teamId}`);
      });

      socket.on('joinDiscussionRoom', (discussionId) => {
        console.log(`    joinDiscussionRoom ${discussionId}`);
        socket.join(`discussionRoom-${discussionId}`);
      });

      socket.on('leaveDiscussionRoom', (discussionId) => {
        console.log(`** leaveDiscussionRoom ${discussionId}`);
        socket.leave(`discussionRoom-${discussionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`disconnected`);
      });
    });
  }
}

function getSocket(socketId?: string) {
  if (!io) {
    return null;
  }

  if (socketId && io.sockets.connected[socketId]) {
    return io.sockets.connected[socketId].broadcast;
  } else {
    return io;
  }
}

function discussionAdded({
  socketId,
  discussion,
}: {
  socketId?: string;
  discussion: DiscussionDocument;
}) {
  const roomName = `teamRoom-${discussion.teamId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('discussionEvent', { actionType: 'added', discussion });
  }
}

function discussionEdited({
  socketId,
  discussion,
}: {
  socketId?: string;
  discussion: DiscussionDocument;
}) {
  const roomName = `teamRoom-${discussion.teamId}`;
  const socket = getSocket(socketId);

  if (socket) {
    socket.to(roomName).emit('discussionEvent', {
      actionType: 'edited',
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
  const roomName = `teamRoom-${teamId}`;
  const socket = getSocket(socketId);

  if (socket) {
    socket.to(roomName).emit('discussionEvent', { actionType: 'deleted', id });
  }
}

function postAdded({ socketId, post }: { socketId?: string; post: PostDocument }) {
  const roomName = `discussionRoom-${post.discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { actionType: 'added', post });
  }
}

function postEdited({ socketId, post }: { socketId?: string; post: PostDocument }) {
  const roomName = `discussionRoom-${post.discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { actionType: 'edited', post });
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
  const roomName = `discussionRoom-${discussionId}`;

  const socket = getSocket(socketId);
  if (socket) {
    socket.to(roomName).emit('postEvent', { actionType: 'deleted', id });
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
