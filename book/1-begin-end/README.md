## Introduction


## Project structure by the end of Chapter 15

```
├── .vscode
│   ├── launch.json
│   └── settings.json
├── api
│   ├── server
│   │   ├── api
│   │   │   ├── index.ts
│   │   │   ├── public.ts
│   │   │   ├── team-leader.ts
│   │   │   └── team-member.ts
│   │   ├── models
│   │   │   ├── Discussion.ts
│   │   │   ├── EmailTemplate.ts
│   │   │   ├── Invitation.ts
│   │   │   ├── Post.ts
│   │   │   ├── Purchase.ts
│   │   │   ├── Team.ts
│   │   │   └── User.ts
│   │   ├── utils
│   │   │   └── slugify.ts
│   │   ├── app.ts
│   │   ├── auth.ts
│   │   ├── aws-s3.ts
│   │   ├── aws-ses.ts
│   │   ├── consts.ts
│   │   ├── env.ts
│   │   ├── logs.ts
│   │   ├── mailchimp.ts
│   │   ├── passwordless.ts
│   │   ├── realtime.ts
│   │   └── stripe.ts
│   ├── static
│   │   └── robots.txt
│   ├── test
│   │   ├── server
│   │   │   └── utils
│   │   └── tsconfig.json
│   ├── .env
│   ├── .gitignore
│   ├── .node-dev.json
│   ├── .npmignore
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── tsconfig.server.json
│   ├── tslint.json
│   └── yarn.lock
├── app
│   ├── components
│   │   ├── common
│   │   │   ├── ActiveLink.tsx
│   │   │   ├── AutoComplete.tsx
│   │   │   ├── Confirm.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── LoginButton.tsx
│   │   │   ├── MenuWithLinks.tsx
│   │   │   ├── MenuWithMenuItems.tsx
│   │   │   └── Notifier.tsx
│   │   ├── discussions
│   │   │   ├── CreateDiscussionForm.tsx
│   │   │   ├── DiscussionActionMenu.tsx
│   │   │   ├── DiscussionList.tsx
│   │   │   ├── DiscussionListItem.tsx
│   │   │   └── EditDiscussionForm.tsx
│   │   ├── layout
│   │   │   ├── index.tsx
│   │   │   └── menus.ts
│   │   ├── posts
│   │   │   ├── PostContent.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   └── PostForm.tsx
│   │   ├── teams
│   │   │   └── InviteMember.tsx
│   │   └── users
│   │       └── MemberChooser.tsx
│   ├── lib
│   │   ├── api
│   │   │   ├── makeQueryString.ts
│   │   │   ├── public.ts
│   │   │   ├── sendRequestAndGetResponse.ts
│   │   │   ├── team-leader.ts
│   │   │   └── team-member.ts
│   │   ├── store
│   │   │   ├── discussion.ts
│   │   │   ├── index.ts
│   │   │   ├── invitation.ts
│   │   │   ├── post.ts
│   │   │   ├── team.ts
│   │   │   └── user.ts
│   │   ├── confirm.ts
│   │   ├── consts.ts
│   │   ├── context.ts
│   │   ├── gtag.ts
│   │   ├── isMobile.ts
│   │   ├── notifier.ts
│   │   ├── resizeImage.ts
│   │   ├── sharedStyles.ts
│   │   ├── withAuth.tsx
│   │   └── withStore.tsx
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── billing.tsx
│   │   ├── create-team.tsx
│   │   ├── discussion.tsx
│   │   ├── invitation.tsx
│   │   ├── login.tsx
│   │   ├── team-settings.tsx
│   │   └── your-settings.tsx
│   ├── server
│   │   ├── app.ts
│   │   ├── env.ts
│   │   └── routesWithSlug.ts
│   ├── static
│   │   └── robots.txt
│   ├── .babelrc
│   ├── .env
│   ├── .env.blueprint
│   ├── .gitignore
│   ├── .npmignore
│   ├── README.md
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.server.json
│   ├── tslint.json
│   └── yarn.lock
├── lambda
│   ├── src
│   │   ├── api -> ../../api/server
│   │   └── sendEmailForNewPost.ts
│   ├── .gitignore
│   ├── README.md
│   ├── handler.ts
│   ├── package.json
│   ├── serverless.yml
│   ├── tsconfig.json
│   ├── tslint.json
│   └── yarn.lock
├── .gitignore
├── .prettierrc.js
├── README.md
```
