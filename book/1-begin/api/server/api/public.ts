// 4
// import * as express from 'express';

// // 10
// // import Invitation from '../models/Invitation';

// const router = express.Router();

// router.get('/get-user', (req, res) => {
//   res.json({ user: req.user || null });
// });

// // temporary in 6
// // router.get('/get-user', (_, res) => {
// //   res.json({ user: { email: 'team@async-await.com' } || null });
// // });

// // 10
// // router.get('/invitations/get-team-by-token', async (req, res, next) => {
// //   try {
// //     const team = await Invitation.getTeamByToken({
// //       token: req.query.token,
// //     });

// //     res.json({ team });
// //   } catch (err) {
// //     next(err);
// //   }
// // });

// // router.post('/invitations/remove-invitation-if-member-added', async (req, res, next) => {
// //   try {
// //     const team = await Invitation.removeIfMemberAdded({
// //       token: req.body.token,
// //       userId: req.user.id,
// //     });

// //     res.json({ team });
// //   } catch (err) {
// //     next(err);
// //   }
// // });

// export default router;
