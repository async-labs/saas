// 10
// import * as mongoose from 'mongoose';
// import logger from '../logs';

// import { generateNumberSlug } from '../utils/slugify';
// import User from './User';

// // 11
// // import { cancelSubscription, createSubscription } from '../stripe';

// mongoose.set('useFindAndModify', false);

// const mongoSchema = new mongoose.Schema({
//   teamLeaderId: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   slug: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   avatarUrl: String,
//   createdAt: {
//     type: Date,
//     required: true,
//   },
//   memberIds: [String],
//   defaultTeam: {
//     type: Boolean,
//     default: false,
//   },

//   // 11
//   // isSubscriptionActive: {
//   //   type: Boolean,
//   //   default: false,
//   // },
//   // stripeSubscription: {
//   //   id: String,
//   //   object: String,
//   //   application_fee_percent: Number,
//   //   billing: String,
//   //   cancel_at_period_end: Boolean,
//   //   billing_cycle_anchor: Number,
//   //   canceled_at: Number,
//   //   created: Number,
//   // },
//   // isPaymentFailed: {
//   //   type: Boolean,
//   //   default: false,
//   // },
// });

// interface TeamDocument extends mongoose.Document {
//   teamLeaderId: string;
//   name: string;
//   slug: string;
//   avatarUrl: string;
//   createdAt: Date;

//   memberIds: string[];

//   // 11
//   // isSubscriptionActive: boolean;
//   // stripeSubscription: {
//   //   id: string;
//   //   object: string;
//   //   application_fee_percent: number;
//   //   billing: string;
//   //   cancel_at_period_end: boolean;
//   //   billing_cycle_anchor: number;
//   //   canceled_at: number;
//   //   created: number;
//   // };
//   // isPaymentFailed: boolean;
// }

// interface TeamModel extends mongoose.Model<TeamDocument> {
//   add({
//     name,
//     userId,
//   }: {
//   userId: string;
//   name: string;
//   avatarUrl: string;
//   }): Promise<TeamDocument>;
//   updateTeam({
//     userId,
//     teamId,
//     name,
//     avatarUrl,
//   }: {
//   userId: string;
//   teamId: string;
//   name: string;
//   avatarUrl: string;
//   }): Promise<TeamDocument>;
//   findBySlug(slug: string): Promise<TeamDocument>;
//   getList(userId: string): Promise<TeamDocument[]>;
//   removeMember({
//     teamId,
//     teamLeaderId,
//     userId,
//   }: {
//   teamId: string;
//   teamLeaderId: string;
//   userId: string;
//   }): Promise<void>;

//   // 11
//   // subscribeTeam({
//   //   teamLeaderId,
//   //   teamId,
//   // }: {
//   // teamLeaderId: string;
//   // teamId: string;
//   // }): Promise<TeamDocument>;
//   // cancelSubscription({
//   //   teamLeaderId,
//   //   teamId,
//   // }: {
//   // teamLeaderId: string;
//   // teamId: string;
//   // }): Promise<TeamDocument>;
//   // cancelSubscriptionAfterFailedPayment({
//   //   subscriptionId,
//   // }: {
//   // subscriptionId: string;
//   // }): Promise<TeamDocument>;
// }

// class TeamClass extends mongoose.Model {
//   public static async add({ userId, name, avatarUrl }) {
//     logger.debug(`Static method: ${name}, ${avatarUrl}`);

//     if (!userId || !name || !avatarUrl) {
//       throw new Error('Bad data');
//     }

//     const slug = await generateNumberSlug(this);

//     let defaultTeam = false;
//     if ((await this.countDocuments({ teamLeaderId: userId })) === 0) {
//       await User.findByIdAndUpdate(userId, { $set: { defaultTeamSlug: slug } });
//       defaultTeam = true;
//     }

//     const team = await this.create({
//       teamLeaderId: userId,
//       name,
//       slug,
//       avatarUrl,
//       memberIds: [userId],
//       createdAt: new Date(),
//       defaultTeam,
//     });

//     return team;
//   }

//   public static async updateTeam({
//     userId, teamId, name, avatarUrl,
//   }) {
//     const team = await this.findById(teamId, 'slug name defaultTeam teamLeaderId');

//     if (!team) {
//       throw new Error('Team not found');
//     }

//     if (team.teamLeaderId !== userId) {
//       throw new Error('Permission denied');
//     }

//     const modifier = { name: team.name, avatarUrl };

//     if (name !== team.name) {
//       modifier.name = name;
//     }

//     await this.updateOne({ _id: teamId }, { $set: modifier }, { runValidators: true });

//     // if (team.defaultTeam) {
//     //   await User.findByIdAndUpdate(userId, { $set: { defaultTeamSlug: modifier.slug } });
//     // }

//     return this.findById(
//       teamId,
//       'name avatarUrl slug defaultTeam isSubscriptionActive stripeSubscription',
//     ).setOptions({ lean: true });
//   }

//   public static findBySlug(slug: string) {
//     return this.findOne({ slug }).setOptions({ lean: true });
//   }

//   public static getList(userId: string) {
//     return this.find({ memberIds: userId }).setOptions({ lean: true });
//   }

//   public static async removeMember({ teamId, teamLeaderId, userId }) {
//     const team = await this.findById(teamId).select('memberIds teamLeaderId');

//     if (team.teamLeaderId !== teamLeaderId || teamLeaderId === userId) {
//       throw new Error('Permission denied');
//     }

//     await this.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } });
//   }

//   // 11
//   // public static async subscribeTeam({ teamLeaderId, teamId }) {
//   //   const team = await this.findById(teamId).select('teamLeaderId isSubscriptionActive');

//   //   logger.debug(team.teamLeaderId, teamLeaderId);

//   //   if (team.teamLeaderId !== teamLeaderId) {
//   //     throw new Error('You do not have permission to subscribe Team.');
//   //   }

//   //   if (team.isSubscriptionActive) {
//   //     throw new Error('Team is already subscribed.');
//   //   }

//   //   const userWithCustomer = await User.findById(teamLeaderId, 'stripeCustomer');

//   //   logger.debug('static method Team', userWithCustomer.stripeCustomer.id);

//   //   const subscriptionObj = await createSubscription({
//   //     customerId: userWithCustomer.stripeCustomer.id,
//   //     teamId,
//   //     teamLeaderId,
//   //   });

//   //   return this.findByIdAndUpdate(
//   //     teamId,
//   //     {
//   //       stripeSubscription: subscriptionObj,
//   //       isSubscriptionActive: true,
//   //     },
//   //     { new: true, runValidators: true },
//   //   )
//   //     .select('isSubscriptionActive stripeSubscription')
//   //     .setOptions({ lean: true });
//   // }

//   // public static async cancelSubscription({ teamLeaderId, teamId }) {
//   //   const team = await this.findById(teamId).select('teamLeaderId isSubscriptionActive stripeSubscription');

//   //   if (team.teamLeaderId !== teamLeaderId) {
//   //     throw new Error('You do not have permission to subscribe Team.');
//   //   }

//   //   if (!team.isSubscriptionActive) {
//   //     throw new Error('Team is already unsubscribed.');
//   //   }

//   //   const cancelledSubscriptionObj = await cancelSubscription({
//   //     subscriptionId: team.stripeSubscription.id,
//   //   });

//   //   return this.findByIdAndUpdate(
//   //     teamId,
//   //     {
//   //       stripeSubscription: cancelledSubscriptionObj,
//   //       isSubscriptionActive: false,
//   //     },
//   //     { new: true, runValidators: true },
//   //   )
//   //     .select('isSubscriptionActive stripeSubscription')
//   //     .setOptions({ lean: true });
//   // }

//   // public static async cancelSubscriptionAfterFailedPayment({ subscriptionId }) {
//   //   const team: any = await this.find({ 'stripeSubscription.id': subscriptionId })
//   //     .select('teamLeaderId isSubscriptionActive stripeSubscription isPaymentFailed')
//   //     .setOptions({ lean: true });
//   //   if (!team.isSubscriptionActive) {
//   //     throw new Error('Team is already unsubscribed.');
//   //   }
//   //   if (team.isPaymentFailed) {
//   //     throw new Error('Team is already unsubscribed after failed payment.');
//   //   }
//   //   const cancelledSubscriptionObj = await cancelSubscription({
//   //     subscriptionId,
//   //   });
//   //   return this.findByIdAndUpdate(
//   //     team._id,
//   //     {
//   //       stripeSubscription: cancelledSubscriptionObj,
//   //       isSubscriptionActive: false,
//   //       isPaymentFailed: true,
//   //     },
//   //     { new: true, runValidators: true },
//   //   )
//   //     .select('isSubscriptionActive stripeSubscription isPaymentFailed')
//   //     .setOptions({ lean: true });
//   // }
// }

// mongoSchema.loadClass(TeamClass);

// const Team = mongoose.model<TeamDocument, TeamModel>('Team', mongoSchema);

// export default Team;
