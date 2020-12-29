import { Response } from 'express';
import * as _ from 'lodash';
import { Server } from 'socket.io';

import { DiscussionDocument } from './models/Discussion';
import { PostDocument } from './models/Post';

let io: Server = null;

const dev = process.env.NODE_ENV !== 'production';

function setupSockets({ httpServer, origin, sessionMiddleware }) {
  if (io === null) {
    io = new Server(httpServer, {
      cors: {
        origin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      },
      cookie: {
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
        domain: dev ? 'localhost' : '.builderbook.org',
        secure: dev ? false : true,
      },
      serveClient: false,
      transports: ['polling', 'websocket'],
    });

    const wrap = (middleware) => (socket, next) => middleware(socket.request, {} as Response, next);

    io.use(wrap(sessionMiddleware));

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

  if (socketId && io.sockets.sockets.get(socketId)) {
    return io.sockets.sockets.get(socketId).broadcast;
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
  setupSockets,
  postAdded,
  postEdited,
  postDeleted,
  discussionAdded,
  discussionEdited,
  discussionDeleted,
};
