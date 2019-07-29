"use strict";
exports.__esModule = true;
var express = require("express");
// 12
// import { signRequestForUpload } from '../aws-s3';
var logs_1 = require("../logs");
// 12
// import Discussion from '../models/Discussion';
// 10
// import Invitation from '../models/Invitation';
// 12
// import Post from '../models/Post';
// 10
// import Team from '../models/Team';
// 6
// import User from '../models/User';
// 13
// import {
//   discussionAdded,
//   discussionDeleted,
//   discussionEdited,
//   postAdded,
//   postDeleted,
//   postEdited,
// } from '../realtime';
var router = express.Router();
router.use(function (req, res, next) {
    logs_1["default"].debug('team member API', req.path);
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
});
// 12
// async function loadDiscussionsData(team, userId, body) {
//   const { discussionSlug } = body;
//   if (!discussionSlug) {
//     return {};
//   }
//   const { discussions } = await Discussion.getList({
//     userId,
//     teamId: team._id,
//   });
//   const data: any = { initialDiscussions: discussions };
//   for (const discussion of discussions) {
//     if (discussion.slug === discussionSlug) {
//       Object.assign(discussion, {
//         initialPosts: await Post.getList({
//           userId,
//           discussionId: discussion._id,
//         }),
//       });
//       break;
//     }
//   }
//   return data;
// }
// 10
// async function loadTeamData(team, userId) {
//   const initialMembers = await User.getTeamMembers({
//     userId,
//     teamId: team._id,
//   });
//   let initialInvitations = [];
//   if (userId === team.teamLeaderId) {
//     initialInvitations = await Invitation.getTeamInvitedUsers({
//       userId,
//       teamId: team._id,
//     });
//   }
//   const data: any = { initialMembers, initialInvitations };
//   return data;
// }
// 12
// async function loadTeamData(team, userId, body) {
//   const initialMembers = await User.getTeamMembers({
//     userId,
//     teamId: team._id,
//   });
//   let initialInvitations = [];
//   if (userId === team.teamLeaderId) {
//     initialInvitations = await Invitation.getTeamInvitedUsers({
//       userId,
//       teamId: team._id,
//     });
//   }
//   Object.assign(team, await loadDiscussionsData(team, userId, body));
//   const data: any = { initialMembers, initialInvitations };
//   return data;
// }
// 10
// router.post('/get-initial-data', async (req, res, next) => {
//   try {
//     const teams = await Team.getList(req.user.id);
//     let selectedTeamSlug = req.body.teamSlug;
//     if (!selectedTeamSlug && teams && teams.length > 0) {
//       selectedTeamSlug = teams[0].slug;
//     }
//     for (const team of teams) {
//       if (team.slug === selectedTeamSlug) {
//         Object.assign(team, await loadTeamData(team, req.user.id));
//         // 12
//         // Object.assign(team, await loadTeamData(team, req.user.id, req.body));
//         break;
//       }
//     }
//     res.json({ teams });
//   } catch (err) {
//     next(err);
//   }
// });
// router.get('/teams', async (req, res, next) => {
//   try {
//     const teams = await Team.getList(req.user.id);
//     res.json({ teams });
//   } catch (err) {
//     next(err);
//   }
// });
// 12
// router.post('/discussions/add', async (req, res, next) => {
//   try {
//     const { name, teamId, memberIds = [], notificationType } = req.body;
//     // 13
//     // const { name, teamId, memberIds = [], notificationType, socketId } = req.body;
//     const discussion = await Discussion.add({
//       userId: req.user.id,
//       name,
//       teamId,
//       memberIds,
//       notificationType,
//     });
//     // 13
//     // discussionAdded({ socketId, discussion });
//     res.json({ discussion });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/discussions/edit', async (req, res, next) => {
//   try {
//     const { name, id, memberIds = [], notificationType } = req.body;
//     // 13
//     // const { name, id, memberIds = [], notificationType, socketId } = req.body;
//     await Discussion.edit({
//       userId: req.user.id,
//       name,
//       id,
//       memberIds,
//       notificationType,
//     });
//     // 13
//     // const updatedDiscussion = await Discussion.edit({
//     //   userId: req.user.id,
//     //   name,
//     //   id,
//     //   memberIds,
//     //   notificationType,
//     // });
//     // 13
//     // discussionEdited({ socketId, discussion: updatedDiscussion });
//     res.json({ done: 1 });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/discussions/delete', async (req, res, next) => {
//   try {
//     const { id } = req.body;
//     // 13
//     // const { id, socketId } = req.body;
//     await Discussion.delete({ userId: req.user.id, id });
//     // 13
//     // const { teamId } = await Discussion.delete({ userId: req.user.id, id });
//     // 13
//     // discussionDeleted({ socketId, teamId, id });
//     res.json({ done: 1 });
//   } catch (err) {
//     next(err);
//   }
// });
// router.get('/discussions/list', async (req, res, next) => {
//   try {
//     const { teamId } = req.query;
//     const { discussions } = await Discussion.getList({
//       userId: req.user.id,
//       teamId,
//     });
//     logger.debug(`Express route: ${discussions.length}`);
//     res.json({ discussions });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/posts/add', async (req, res, next) => {
//   try {
//     const { content, discussionId } = req.body;
//     // 13
//     // const { content, discussionId, socketId } = req.body;
//     const post = await Post.add({ userId: req.user.id, content, discussionId });
//     // 13
//     // postAdded({ socketId, post });
//     res.json({ post });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/posts/edit', async (req, res, next) => {
//   try {
//     const { content, id } = req.body;
//     // 13
//     // const { content, id, socketId } = req.body;
//     await Post.edit({ userId: req.user.id, content, id });
//     // 13
//     // const updatedPost = await Post.edit({ userId: req.user.id, content, id });
//     // 13
//     // postEdited({ socketId, post: updatedPost });
//     res.json({ done: 1 });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/posts/delete', async (req, res, next) => {
//   try {
//     const { id } = req.body;
//     // 13
//     // const { id, socketId, discussionId } = req.body;
//     await Post.delete({ userId: req.user.id, id });
//     // 13
//     // postDeleted({ socketId, id, discussionId });
//     res.json({ done: 1 });
//   } catch (err) {
//     next(err);
//   }
// });
// router.get('/posts/list', async (req, res, next) => {
//   try {
//     const posts = await Post.getList({
//       userId: req.user.id,
//       discussionId: req.query.discussionId,
//     });
//     res.json({ posts });
//   } catch (err) {
//     next(err);
//   }
// });
// // Upload file to S3
// router.get('/aws/get-signed-request-for-upload-to-s3', async (req, res, next) => {
//   try {
//     const { fileName, fileType, prefix, bucket, acl = 'private' } = req.query;
//     const returnData = await signRequestForUpload({
//       fileName,
//       fileType,
//       prefix,
//       bucket,
//       user: req.user,
//       acl,
//     });
//     res.json(returnData);
//   } catch (err) {
//     next(err);
//   }
// });
// 6
// router.post('/user/update-profile', async (req, res, next) => {
//   try {
//     const { name, avatarUrl } = req.body;
//     const updatedUser = await User.updateProfile({
//       userId: req.user.id,
//       name,
//       avatarUrl,
//     });
//     res.json({ updatedUser });
//   } catch (err) {
//     next(err);
//   }
// });
// router.post('/user/toggle-theme', async (req, res, next) => {
//   try {
//     const { darkTheme } = req.body;
//     await User.toggleTheme({ userId: req.user.id, darkTheme });
//     res.json({ done: 1 });
//   } catch (err) {
//     next(err);
//   }
// });
exports["default"] = router;
//# sourceMappingURL=team-member.js.map