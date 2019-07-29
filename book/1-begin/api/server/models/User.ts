// 6
// import * as _ from 'lodash';
// import * as mongoose from 'mongoose';

// // 8
// // import sendEmail from '../aws-ses';

// import logger from '../logs';

// // 7
// // import { subscribe } from '../mailchimp';

// import { generateSlug } from '../utils/slugify';

// // 8
// // import getEmailTemplate, { EmailTemplate } from './EmailTemplate';

// // 10
// // import Invitation from './Invitation';
// // import Team from './Team';

// // 11
// // import {
// //   createCustomer,
// //   createNewCard,
// //   getListOfInvoices,
// //   retrieveCard,
// //   updateCustomer,
// // } from '../stripe';

// // 8
// // import { EMAIL_SUPPORT_FROM_ADDRESS } from '../consts';

// mongoose.set('useFindAndModify', false);

// const mongoSchema = new mongoose.Schema({
//   // 7
//   // googleId: {
//   //   type: String,
//   //   unique: true,
//   //   sparse: true,
//   // },
//   // googleToken: {
//   //   accessToken: String,
//   //   refreshToken: String,
//   // },
//   slug: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   createdAt: {
//     type: Date,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },

//   // 10
//   // defaultTeamSlug: {
//   //   type: String,
//   //   default: '',
//   // },

//   isAdmin: {
//     type: Boolean,
//     default: false,
//   },
//   displayName: String,
//   avatarUrl: String,

//   darkTheme: Boolean,

//   // 11
//   // stripeCustomer: {
//   //   id: String,
//   //   object: String,
//   //   created: Number,
//   //   currency: String,
//   //   default_source: String,
//   //   description: String,
//   // },
//   // stripeCard: {
//   //   id: String,
//   //   object: String,
//   //   brand: String,
//   //   funding: String,
//   //   country: String,
//   //   last4: String,
//   //   exp_month: Number,
//   //   exp_year: Number,
//   // },
//   // hasCardInformation: {
//   //   type: Boolean,
//   //   default: false,
//   // },
//   // stripeListOfInvoices: {
//   //   object: String,
//   //   has_more: Boolean,
//   //   data: [
//   //     {
//   //       id: String,
//   //       object: String,
//   //       amount_paid: Number,
//   //       date: Number,
//   //       customer: String,
//   //       subscription: String,
//   //       hosted_invoice_url: String,
//   //       billing: String,
//   //       paid: Boolean,
//   //       number: String,
//   //       teamId: String,
//   //       teamName: String,
//   //     },
//   //   ],
//   // },
// });

// export interface IUserDocument extends mongoose.Document {
//   // 7
//   // googleId: string;
//   // googleToken: { accessToken: string; refreshToken: string };
//   slug: string;
//   createdAt: Date;

//   email: string;
//   isAdmin: boolean;
//   displayName: string;
//   avatarUrl: string;

//   // 10
//   // defaultTeamSlug: string;

//   darkTheme: boolean;

//   // 11
//   // hasCardInformation: boolean;
//   // stripeCustomer: {
//   //   id: string;
//   //   default_source: string;
//   //   created: number;
//   //   object: string;
//   //   description: string;
//   // };
//   // stripeCard: {
//   //   id: string;
//   //   object: string;
//   //   brand: string;
//   //   country: string;
//   //   last4: string;
//   //   exp_month: number;
//   //   exp_year: number;
//   //   funding: string;
//   // };
//   // stripeListOfInvoices: {
//   //   object: string;
//   //   has_more: boolean;
//   //   data: [
//   //     {
//   //       id: string;
//   //       object: string;
//   //       amount_paid: number;
//   //       date: number;
//   //       customer: string;
//   //       subscription: string;
//   //       hosted_invoice_url: string;
//   //       billing: string;
//   //       paid: boolean;
//   //       number: string;
//   //       teamId: string;
//   //       teamName: string;
//   //     }
//   //   ];
//   // };
// }

// interface IUserModel extends mongoose.Model<IUserDocument> {
//   publicFields(): string[];

//   updateProfile({
//     userId,
//     name,
//     avatarUrl,
//   }: {
//     userId: string;
//     name: string;
//     avatarUrl: string;
//   }): Promise<IUserDocument[]>;

//   getTeamMembers({ userId, teamId }: { userId: string; teamId: string }): Promise<IUserDocument[]>;

//   signInOrSignUp({
//     // 7
//     // googleId,
//     // googleToken,
//     email,
//     displayName,
//     avatarUrl,
//   }: {
//     // 7
//     // googleId: string;
//     // googleToken: { refreshToken?: string; accessToken?: string };
//     email: string;
//     displayName: string;
//     avatarUrl: string;
//   }): Promise<IUserDocument>;

//   signUpByEmail({ uid, email }: { uid: string; email: string }): Promise<IUserDocument>;

//   // 11
//   // createCustomer({
//   //   userId,
//   //   stripeToken,
//   // }: {
//   //   userId: string;
//   //   stripeToken: object;
//   // }): Promise<IUserDocument>;

//   // createNewCardUpdateCustomer({
//   //   userId,
//   //   stripeToken,
//   // }: {
//   //   userId: string;
//   //   stripeToken: object;
//   // }): Promise<IUserDocument>;
//   // getListOfInvoicesForCustomer({ userId }: { userId: string }): Promise<IUserDocument>;
//   toggleTheme({ userId, darkTheme }: { userId: string; darkTheme: boolean }): Promise<void>;
// }

// class UserClass extends mongoose.Model {
//   public static async updateProfile({ userId, name, avatarUrl }) {
//     // TODO: If avatarUrl is changed and old is uploaded to our S3, delete it from S3

//     const user = await this.findById(userId, 'slug displayName');

//     const modifier = { displayName: user.displayName, avatarUrl, slug: user.slug };

//     if (name !== user.displayName) {
//       modifier.displayName = name;
//       modifier.slug = await generateSlug(this, name);
//     }

//     return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
//       .select('displayName avatarUrl slug')
//       .setOptions({ lean: true });
//   }

//   // 11
//   // public static async createCustomer({ userId, stripeToken }) {
//   //   const user = await this.findById(userId, 'email');

//   //   const customerObj = await createCustomer({
//   //     token: stripeToken.id,
//   //     teamLeaderEmail: user.email,
//   //     teamLeaderId: userId,
//   //   });

//   //   logger.debug(customerObj.default_source.toString());

//   //   const cardObj = await retrieveCard({
//   //     customerId: customerObj.id,
//   //     cardId: customerObj.default_source.toString(),
//   //   });

//   //   const modifier = { stripeCustomer: customerObj, stripeCard: cardObj, hasCardInformation: true };

//   //   return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
//   //     .select('stripeCustomer stripeCard hasCardInformation')
//   //     .setOptions({ lean: true });
//   // }

//   // public static async createNewCardUpdateCustomer({ userId, stripeToken }) {
//   //   const user = await this.findById(userId, 'stripeCustomer');

//   //   logger.debug('called static method on User');

//   //   const newCardObj = await createNewCard({
//   //     customerId: user.stripeCustomer.id,
//   //     token: stripeToken.id,
//   //   });

//   //   logger.debug(newCardObj.id);

//   //   const updatedCustomerObj = await updateCustomer({
//   //     customerId: user.stripeCustomer.id,
//   //     newCardId: newCardObj.id,
//   //   });

//   //   const modifier = { stripeCustomer: updatedCustomerObj, stripeCard: newCardObj };

//   //   return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
//   //     .select('stripeCard')
//   //     .setOptions({ lean: true });
//   // }

//   // public static async getListOfInvoicesForCustomer({ userId }) {
//   //   const user = await this.findById(userId, 'stripeCustomer');

//   //   logger.debug('called static method on User');

//   //   const newListOfInvoices = await getListOfInvoices({
//   //     customerId: user.stripeCustomer.id,
//   //   });

//   //   const modifier = {
//   //     stripeListOfInvoices: newListOfInvoices,
//   //   };

//   //   if (!newListOfInvoices) {
//   //     throw new Error('There is no payment history.');
//   //   }

//   //   return this.findByIdAndUpdate(userId, { $set: modifier }, { new: true, runValidators: true })
//   //     .select('stripeListOfInvoices')
//   //     .setOptions({ lean: true });
//   // }

//   // 10
//   // public static async getTeamMembers({ userId, teamId }) {
//   //   const team = await this.checkPermissionAndGetTeam({ userId, teamId });

//   //   return this.find({ _id: { $in: team.memberIds } })
//   //     .select(this.publicFields().join(' '))
//   //     .setOptions({ lean: true });
//   // }

//   public static async signInOrSignUp({ email, displayName, avatarUrl }) {
//   // 7
//   // public static async signInOrSignUp({ googleId, email, googleToken, displayName, avatarUrl }) {

//     // const user = await this.findOne({ googleId })
//     //   .select(this.publicFields().join(' '))
//     //   .setOptions({ lean: true });

//     // if (user) {
//     //   if (_.isEmpty(googleToken)) {
//     //     return user;
//     //   }

//     //   const modifier = {};
//     //   if (googleToken.accessToken) {
//     //     modifier['googleToken.accessToken'] = googleToken.accessToken;
//     //   }

//     //   if (googleToken.refreshToken) {
//     //     modifier['googleToken.refreshToken'] = googleToken.refreshToken;
//     //   }

//     //   await this.updateOne({ googleId }, { $set: modifier });

//     //   return user;
//     // }

//     const slug = await generateSlug(this, displayName);

//     const newUser = await this.create({
//       createdAt: new Date(),
//       // 7
//       // googleId,
//       // googleToken,
//       email,
//       displayName,
//       avatarUrl,
//       slug,
//       // 10
//       // defaultTeamSlug: '',
//     });

//     // 10
//     // const hasInvitation = (await Invitation.countDocuments({ email })) > 0;

//     // 8
//     // const emailTemplate = await EmailTemplate.findOne({ name: 'welcome' }).setOptions({
//     //   lean: true,
//     // });

//     // if (!emailTemplate) {
//     //   throw new Error('welcome Email template not found');
//     // }

//     // const template = await getEmailTemplate('welcome', { userName: displayName }, emailTemplate);

//     // try {
//     //   await sendEmail({
//     //     from: `Kelly from async-await.com <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
//     //     to: [email],
//     //     subject: template.subject,
//     //     body: template.message,
//     //   });
//     // } catch (err) {
//     //   logger.error('Email sending error:', err);
//     // }

//     // 10
//     // if (!hasInvitation) {
//     //   try {
//     //     await sendEmail({
//     //       from: `Kelly from async-await.com <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
//     //       to: [email],
//     //       subject: template.subject,
//     //       body: template.message,
//     //     });
//     //   } catch (err) {
//     //     logger.error('Email sending error:', err);
//     //   }
//     // }

//     // 7
//     // try {
//     //   await subscribe({ email, listName: 'signups' });
//     // } catch (error) {
//     //   logger.error('Mailchimp error:', error);
//     // }

//     return _.pick(newUser, this.publicFields());
//   }

//   public static async signUpByEmail({ uid, email }) {
//     const user = await this.findOne({ email })
//       .select(this.publicFields().join(' '))
//       .setOptions({ lean: true });

//     if (user) {
//       throw Error('User already exists');
//     }

//     const slug = await generateSlug(this, email);

//     const newUser = await this.create({
//       _id: uid,
//       createdAt: new Date(),
//       email,
//       slug,
//       // 10
//       // defaultTeamSlug: '',
//     });

//     // 10
//     // const hasInvitation = (await Invitation.countDocuments({ email })) > 0;

//     // 8
//     // const emailTemplate = await EmailTemplate.findOne({ name: 'welcome' }).setOptions({
//     //   lean: true,
//     // });

//     // if (!emailTemplate) {
//     //   throw new Error('welcome Email template not found');
//     // }

//     // const template = await getEmailTemplate('welcome', { userName: email }, emailTemplate);

//     // try {
//     //   await sendEmail({
//     //     from: `Kelly from async-await.com <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
//     //     to: [email],
//     //     subject: template.subject,
//     //     body: template.message,
//     //   });
//     // } catch (err) {
//     //   logger.error('Email sending error:', err);
//     // }

//     // 10
//     // if (!hasInvitation) {
//     //   try {
//     //     await sendEmail({
//     //       from: `Kelly from async-await.com <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
//     //       to: [email],
//     //       subject: template.subject,
//     //       body: template.message,
//     //     });
//     //   } catch (err) {
//     //     logger.error('Email sending error:', err);
//     //   }
//     // }

//     // 7
//     // try {
//     //   await subscribe({ email, listName: 'signups' });
//     // } catch (error) {
//     //   logger.error('Mailchimp error:', error);
//     // }

//     return _.pick(newUser, this.publicFields());
//   }

//   public static publicFields(): string[] {
//     return [
//       '_id',
//       'id',
//       'displayName',
//       'email',
//       'avatarUrl',
//       'slug',
//       'isGithubConnected',
//       // 10
//       // 'defaultTeamSlug',

//       // 11
//       // 'hasCardInformation',
//       // 'stripeCustomer',
//       // 'stripeCard',
//       // 'stripeListOfInvoices',
//       'darkTheme',
//     ];
//   }

//   // 10
//   // public static async checkPermissionAndGetTeam({ userId, teamId }) {
//   //   if (!userId || !teamId) {
//   //     throw new Error('Bad data');
//   //   }

//   //   const team = await Team.findById(teamId)
//   //     .select('memberIds')
//   //     .setOptions({ lean: true });

//   //   if (!team || team.memberIds.indexOf(userId) === -1) {
//   //     throw new Error('Team not found');
//   //   }

//   //   return team;
//   // }

//   public static toggleTheme({ userId, darkTheme }) {
//     return this.updateOne({ _id: userId }, { darkTheme: !!darkTheme });
//   }
// }

// mongoSchema.loadClass(UserClass);

// const User = mongoose.model<IUserDocument, IUserModel>('User', mongoSchema);
// User.ensureIndexes(err => {
//   if (err) {
//     logger.error(`User.ensureIndexes: ${err.stack}`);
//   }
// });

// export default User;
