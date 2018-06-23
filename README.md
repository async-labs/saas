## SaaS Boilerplate
Open source web app that saves you weeks of work when building your own SaaS product. 

The boilerplate app comes with many basic SaaS features (see `Features` below) so that you are able to focus on features that differentiate your product.

We built this boilerplate for ourselves to focus more on what matters and successfully used it to quickly launch multiple SaaS web apps.

We used this boilerplate to build [async](https://async-await.com), [builderbook](https://builderbook.org), and other real-world web apps.


## Live demo: 
- https://saas-app.async-await.com

## Contents
- [Features](#features)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Built with](#built-with)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Other projects](#other-projects)
- [Team](#team)
- [License](#license)
- [Project structure](#project-structure)

## Features
- User authentication with Google, cookie, session, compression, parses and helmet.
- Transactional emails (AWS SES): welcome, team invitation, payment.
- Adding email addresses to newsletter lists (Mailchimp): new users, paying users.
- File upload, load, deletion (AWS S3) with pre-signed request for: Posts, Team Profile, User Profile.
- Team creation.
- Team member invitation.
- Settings for Team and User.
- Opinionated architecture: 
  - keeping babel and webpack configurations under the hood,
  - striving to minimize number of configurations,
  - `withAuth` HOC to pass user prop and control user access to pages,
  - `withLayout` HOC for shared layout and to pass additional data to pages,
  - `withStore` HOC, developer-friendly state management with `MobX`,
  - server-side rendering with `Material-UI`,
  - model-specific components in addition to common components,
- Universally-available environmental variables at runtime.
- Server-side environmental variables managed with `dotenv`.
- Custom logger (configure what not to print in production)
- Many useful components for any web app: `ActiveLink`, `AutoComplete`, `Confirm`, `Notifier`, `MenuWithLinks` and more.
- Analytics with `Google Analytics`
- Production-ready, scalable, architecture:
  - `app` - user-facing web app with Next/Express server, responsible for rendering of pages (either client-side and server-side). `app` sends requests via API methods and fetch to `api` server's Express routes.
  - `api` - server-only web app with Express server, responsible for processing of requests for internal and external APIs.
  - we prepared both apps for easy deployment to `now` by Zeit.


- (upcoming) Subscribing to plan, managing subscription and card information.


## Run locally

Below are instructions on how to run two apps (`app` and `api`).

To run `app`, inside `app` folder, run below command and navigate to `http://localhost:3000`:
```
GA_TRACKING_ID=UA-xxxxxxxxx-x yarn dev
```

You are welcome to remove GA integration or pass universally available variable inside code. If you do so, your command for `app` will become:
```
yarn dev
```

To run `api`, inside `api` folder, run below command:
```
yarn dev
```

Internal and external API requests will be sent from `http://localhost:3000` to `http://localhost:8000`.

All environmental variables in `api` are avaialable on server only and kept in a `.env` file that you should create, add environmental variables to it and keep this file in `.gitignore`.


## Deploy

To run the two apps (`app` and `api`) at the same time, follow the instructions below.

- Inside `app` folder, create `now.json` file with following content:
  ```
  {
    "env": {
        "NODE_ENV": "production",
        "GA_TRACKING_ID": "UA-xxxxxxxxx-x",
        "PRODUCTION_URL_APP": "https://saas-app.async-await.com",
        "PRODUCTION_URL_API": "https://saas-api.async-await.com"
    },
    "alias": "saas-app.async-await.com",
    "scale": {
      "sfo1": {
        "min": 1,
        "max": 1
      }
    }
  }
  ```
  Remember to edit `now.json` so it reflects your `GA_TRACKING_ID` and domains.

- Inside `api` folder, create `now.json` file with following content:
  ```
  {
    "env": {
        "NODE_ENV": "production"
    },
    "dotenv": true,
    "alias": "saas-api.async-await.com",
    "scale": {
      "sfo1": {
        "min": 1,
        "max": 1
      }
    }
  }
  ```
  Remember to edit `now.json` so it reflects your domain.

Follow [these simple steps](https://github.com/builderbook/builderbook#deploy) to deploy each app to `Now` by Zeit.

Learn how to configure and scale your deployment: [Now docs](https://zeit.co/docs/features/configuration).

You are welcome to deploy to any cloud provider, we plan to publish tutorial for AWS Elastic Beanstalk.


## Built with

- [React](https://github.com/facebook/react)
- [Material-UI](https://github.com/mui-org/material-ui)
- [Next](https://github.com/zeit/next.js)
- [MobX](https://github.com/mobxjs/mobx)
- [Express](https://github.com/expressjs/express)
- [Mongoose](https://github.com/Automattic/mongoose)
- [MongoDB](https://github.com/mongodb/mongo)
- [Typescript](https://github.com/Microsoft/TypeScript)

For more detail, check `package.json` files in both `app` and `api` folders.

To customize styles, check [this guide](https://github.com/builderbook/builderbook#add-your-own-styles).


## Screenshots
Dashboard showing Topic > Discussion > Post:
![saas-dashboard](https://user-images.githubusercontent.com/26158226/41631311-c5e23cca-73e8-11e8-900a-04ff5bf386e7.png)

Adding a Post, Markdown vs. HTML view:
![saas-addpost-markdown](https://user-images.githubusercontent.com/26158226/41631310-c5c5f3a8-73e8-11e8-93b3-a3400e7d1a3b.png)
![saas-addpost-html](https://user-images.githubusercontent.com/26158226/41631309-c5a4e1e0-73e8-11e8-937b-79e9df6c2e60.png)

Settings for Team Members:
![saas-teammembers](https://user-images.githubusercontent.com/26158226/41631312-c5fe775a-73e8-11e8-87f8-a66b5d59eba9.png)

Settings for Personal Profile:
![saas-yourprofile](https://user-images.githubusercontent.com/26158226/41631313-c61e0df4-73e8-11e8-808d-b6d1f8042817.png)


## Contributing
If you'd like to contribute, check out our [todo list](https://github.com/async-labs/saas/issues/1) for features you can discuss and add.

To report a bug, create an [issue](https://github.com/async-labs/saas/issues/new).


## Other projects
Want to support this project?
Sign up at [async](https://async-await.com) and/or buy our [book](https://builderbook.org/book).


## Team
- [Kelly Burke](https://github.com/klyburke)
- [Delgermurun Purevkhuu](https://github.com/delgermurun)
- [Timur Zhiyentayev](https://github.com/tima101)


## License
All code in this repository is provided under the MIT License.


## Project structure

```
├── api
│   ├── server
│   │   ├── api
│   │   │   ├── admin.ts
│   │   │   ├── index.ts
│   │   │   ├── public.ts
│   │   │   ├── team-leader.ts
│   │   │   ├── team-member.ts
│   │   ├── models
│   │   │   ├── Discussion.ts
│   │   │   ├── EmailTemplate.ts
│   │   │   ├── Invitation.ts
│   │   │   ├── Post.ts
│   │   │   ├── Purchase.ts
│   │   │   ├── Team.ts
│   │   │   ├── Topic.ts
│   │   │   ├── User.ts
│   │   ├── utils
│   │   │   ├── slugify.ts
│   │   ├── app.ts
│   │   ├── aws-s3.ts
│   │   ├── aws-ses.ts
│   │   ├── google.ts
│   │   ├── logs.ts
│   │   ├── mailchimp.ts
│   │   ├── stripe.ts
│   ├── static
│   ├── test/server/utils
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .npmignore
│   ├── nodemon.js             
│   ├── package.json
│   ├── tsconfig.json
│   ├── yarn.lock
├── app
│   ├── components
│   │   ├── common
│   │   │   ├── ActiveLink.tsx
│   │   │   ├── AutoComplete.tsx
│   │   │   ├── AvatarwithMenu.tsx
│   │   │   ├── Confirm.tsx
│   │   │   ├── LoginButton.tsx
│   │   │   ├── MenuWithLinks.tsx
│   │   │   ├── MenuWithMenuItems.tsx
│   │   │   ├── Notifier.tsx
│   │   │   ├── SettingList.tsx
│   │   ├── discussions
│   │   │   ├── CreateDiscussionForm.tsx
│   │   │   ├── DiscussionActionMenu.tsx
│   │   │   ├── DiscussionList.tsx
│   │   │   ├── EditDiscussionForm.tsx
│   │   ├── posts
│   │   │   ├── PostContent.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   ├── PostForm.tsx
│   │   ├── teams
│   │   │   ├── InviteMember.tsx
│   │   ├── topics
│   │   │   ├── CreateTopicForm.tsx
│   │   │   ├── EditTopicForm.tsx
│   │   │   ├── TopicActionMenu.tsx
│   │   │   ├── TopicList.tsx
│   ├── lib
│   │   ├── api
│   │   │   ├── admin.ts
│   │   │   ├── getRootUrl.ts
│   │   │   ├── makeQueryString.ts
│   │   │   ├── public.ts
│   │   │   ├── sendRequestAndGetResponse.ts
│   │   │   ├── team-leader.ts
│   │   │   ├── team-member.ts
│   │   ├── store
│   │   │   ├── discussion.ts
│   │   │   ├── index.ts
│   │   │   ├── invitation.ts
│   │   │   ├── post.ts
│   │   │   ├── team.ts
│   │   │   ├── topic.ts
│   │   │   ├── user.ts
│   │   ├── confirm.ts
│   │   ├── context.ts
│   │   ├── env.js
│   │   ├── gtag.js
│   │   ├── notifier.ts
│   │   ├── sharedStyles.ts
│   │   ├── withAuth.tsx
│   │   ├── withLayout.tsx
│   │   ├── withStore.tsx
│   ├── pages
│   │   ├── discussions
│   │   │   ├── detail.tsx
│   │   ├── settings
│   │   │   ├── create-team.tsx
│   │   │   ├── team-billing.tsx
│   │   │   ├── team-members.tsx
│   │   │   ├── team-profile.tsx
│   │   │   ├── your-profile.tsx
│   │   ├── topics
│   │   │   ├── detail.tsx
│   │   ├── _document.tsx
│   │   ├── invitation.tsx
│   │   ├── login.tsx
│   ├── server
│   │   ├── app.ts
│   │   ├── routesWithSlug.ts
│   ├── static
│   │   ├── robots.txt
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .npmignore
│   ├── next.config.js
│   ├── nodemon.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.server.json
│   ├── yarn.lock

```
