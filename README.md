## Boilerplate App for SaaS Product
Open source web app that saves you weeks of work when building your own SaaS product. 
- The boilerplate app comes with many basic SaaS features (see [Features](https://github.com/async-labs/saas#features) below) so that you are able to focus on features that differentiate your product.
- We built this boilerplate for ourselves to focus more on what matters. We've used it to quickly launch [async](https://async-await.com), [builderbook](https://builderbook.org), and other real-world SaaS web apps.


## Live demo: 
- https://saas-app.async-await.com


## Contents
- [Features](#features)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Built with](#built-with)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Showcase](#showcase)
- [Team](#team)
- [License](#license)
- [Project structure](#project-structure)


## Features
- User authentication with Google, cookie, and session.
- Production-ready Express server with compression, parser, and helmet.
- Transactional emails (`AWS SES`): welcome, team invitation, and payment.
- Adding email addresses to newsletter lists (`Mailchimp`): new users, paying users.
- File upload, load, and deletion (`AWS S3`) with pre-signed request for: Posts, Team Profile, and User Profile.
- Team creation, Team Member invitation, and settings for Team and User.
- Opinionated architecture: 
  - keeping babel and webpack configurations under the hood,
  - striving to minimize number of configurations,
  - `withAuth` HOC to pass user prop and control user access to pages,
  - `withLayout` HOC for shared layout and to pass additional data to pages,
  - `withStore` HOC, developer-friendly state management with `MobX`,
  - server-side rendering with `Material-UI`,
  - model-specific components in addition to common components.
- Universally-available environmental variables at runtime.
- Server-side environmental variables managed with `dotenv`.
- Custom logger (configure what _not_ to print in production).
- Useful components for any web app: `ActiveLink`, `AutoComplete`, `Confirm`, `Notifier`, `MenuWithLinks`, and more.
- Analytics with `Google Analytics`.
- Production-ready, scalable architecture:
  - `app` - user-facing web app with Next/Express server, responsible for rendering pages (either client-side or server-side). `app` sends requests via API methods and fetch to `api` server's Express routes.
  - `api` - server-only web app with Express server, responsible for processing requests for internal and external APIs.
  - we prepared both apps for easy deployment to `now` by Zeit.
- (upcoming) Payments with `Stripe`: subscribing to plan, managing subscription and card information.


## Run locally
To run locally, you will need to run two apps: `api` and `app`.

#### Running `api` app:
- Before running, create a `.env` file inside the `api` folder with the environmental variables listed below.<br/> 
  This file _must_ have values for the `required` variables.<br/>
  To use all features and third-party integrations, also add the `optional` variables. <br/>
  
  `.env`:
  ```
  # Used in api/server/app.ts, REQUIRED
  MONGO_URL="xxxxxx"
  MONGO_URL_TEST="xxxxxx"
  SESSION_SECRET="xxxxxx"

  # Used in api/server/google.ts, REQUIRED
  Google_clientID="xxxxxx"
  Google_clientSecret="xxxxxx"

  # Used in api/server/aws-s3.ts and api/server/aws-ses.ts, OPTIONAL
  Amazon_accessKeyId="xxxxxx"
  Amazon_secretAccessKey="xxxxxx"

  # Used in api/server/models/Invitation.ts and api/server/models/User.ts, OPTIONAL
  EMAIL_SUPPORT_FROM_ADDRESS="xxxxxx"

  # Used in api/server/mailchimp.ts, OPTIONAL
  MAILCHIMP_API_KEY="xxxxxx"
  MAILCHIMP_REGION="xxxxxx"
  MAILCHIMP_SAAS_ALL_LIST_ID="xxxxxx"
  ```
  Important: The above environmental variables are available on the server only. You should add your `.env` file to `.gitignore` inside the `api` folder so that your secret keys are not stored on a remote Github repo.
  
  - To get `MONGO_URL` and `MONGO_URL_TEST`, we recommend a [free MongoDB at mLab](https://docs.mlab.com/).
  - Specify your own secret key for Express session `SESSION_SECRET`: https://github.com/expressjs/session#secret
  - Get `Google_clientID` and `Google_clientSecret` by following the [official OAuth tutorial](https://developers.google.com/identity/sign-in/web/sign-in#before_you_begin). <br/>
    Important: For Google OAuth app, callback URL is: http://localhost:8000/oauth2callback <br/>
    Important: You have to enable Google+ API in your Google Cloud Platform account.

- Once `.env` is created, you can run the `api` app. Navigate to the `api` folder, run `yarn` to add all packages, then run the command below:
  ```
  yarn dev
  ```

#### Running `app` app:
- Navigate to the `app` folder, run `yarn` to add all packages, then run the command below and navigate to `http://localhost:3000`:
  ```
  GA_TRACKING_ID=UA-xxxxxxxxx-x yarn dev
  ```
  - To get `GA_TRACKING_ID`, set up Google Analytics and follow [these instructions](https://support.google.com/analytics/answer/1008080?hl=en) to find your tracking ID.
  
  You are welcome to remove Google Analytics integration or pass universally available variables inside the code. If you do so, your command to run `app` will be:
  ```
  yarn dev
  ```

Internal and external API requests will be sent from `http://localhost:3000` to `http://localhost:8000`.


## Deploy
To deploy the two apps (`api` and `app`), follow the instructions below.

- Inside the `api` folder, create a `now.json` file with the following content:
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
  
- Inside the `app` folder, create a `now.json` file with the following content:
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

- Follow [these simple steps](https://github.com/builderbook/builderbook#deploy) to deploy each app to `Now` cloud by Zeit.

Learn how to configure and scale your deployment: [Now docs](https://zeit.co/docs/features/configuration).

You are welcome to deploy to any cloud provider. We plan to publish a tutorial for AWS Elastic Beanstalk.


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

Menu dropdown to switch between Teams:
![menudrop-selectteam](https://user-images.githubusercontent.com/26158226/41943540-a7c515a8-7958-11e8-9fd0-5c372ab51c1a.png)


## Showcase
Check out projects built with the code in this open source app. Feel free to add your own project by creating a pull request.
- [Retaino](https://retaino.com) by [Earl Lee](https://github.com/earllee) : Save, annotate, review, and share great web content. Receive smart email digests to retain key information.
- [Async homepage and blog](https://async-await.com/): Communication tool for engineering teams to achieve deep work.
- [Builder Book](https://github.com/builderbook/builderbook): Open source web app to publish documentation or books. Built with React, Material-UI, Next, Express, Mongoose, MongoDB.
- [Harbor](https://github.com/builderbook/harbor): Open source web app that allows anyone with a Gmail account to automatically charge for advice sent via email.


## Contributing
If you'd like to contribute, check our [todo list](https://github.com/async-labs/saas/issues/1) for features you can discuss and add. To report a bug, create an [issue](https://github.com/async-labs/saas/issues/new).

Want to support this project? Sign up at [async](https://async-await.com) and/or buy our [book](https://builderbook.org/book).

If you're interested in hiring our team to build custom SaaS features, fill out our [form](https://goo.gl/forms/4kk6mvowOjkQY21y2).


## Team
- [Kelly Burke](https://github.com/klyburke)
- [Delgermurun Purevkhuu](https://github.com/delgermurun)
- [Timur Zhiyentayev](https://github.com/tima101)


## License
All code in this repository is provided under the [MIT License](https://github.com/async-labs/saas/blob/master/LICENSE.md).


## Project structure

#### Structure for `api` app:
```
├── server
│   ├── api
│   │   ├── admin.ts
│   │   ├── index.ts
│   │   ├── public.ts
│   │   ├── team-leader.ts
│   │   ├── team-member.ts
│   ├── models
│   │   ├── Discussion.ts
│   │   ├── EmailTemplate.ts
│   │   ├── Invitation.ts
│   │   ├── Post.ts
│   │   ├── Purchase.ts
│   │   ├── Team.ts
│   │   ├── Topic.ts
│   │   ├── User.ts
│   ├── utils
│   │   ├── slugify.ts
│   ├── app.ts
│   ├── aws-s3.ts
│   ├── aws-ses.ts
│   ├── google.ts
│   ├── logs.ts
│   ├── mailchimp.ts
│   ├── stripe.ts
├── static
├── test/server/utils
├── .eslintrc.js
├── .gitignore
├── .npmignore
├── nodemon.js             
├── package.json
├── tsconfig.json
├── yarn.lock
```

#### Structure for `app` app:
```
├── components
│   ├── common
│   │   ├── ActiveLink.tsx
│   │   ├── AutoComplete.tsx
│   │   ├── AvatarwithMenu.tsx
│   │   ├── Confirm.tsx
│   │   ├── LoginButton.tsx
│   │   ├── MenuWithLinks.tsx
│   │   ├── MenuWithMenuItems.tsx
│   │   ├── Notifier.tsx
│   │   ├── SettingList.tsx
│   ├── discussions
│   │   ├── CreateDiscussionForm.tsx
│   │   ├── DiscussionActionMenu.tsx
│   │   ├── DiscussionList.tsx
│   │   ├── EditDiscussionForm.tsx
│   ├── posts
│   │   ├── PostContent.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostEditor.tsx
│   │   ├── PostForm.tsx
│   ├── teams
│   │   ├── InviteMember.tsx
│   ├── topics
│   │   ├── CreateTopicForm.tsx
│   │   ├── EditTopicForm.tsx
│   │   ├── TopicActionMenu.tsx
│   │   ├── TopicList.tsx
├── lib
│   ├── api
│   │   ├── admin.ts
│   │   ├── getRootUrl.ts
│   │   ├── makeQueryString.ts
│   │   ├── public.ts
│   │   ├── sendRequestAndGetResponse.ts
│   │   ├── team-leader.ts
│   │   ├── team-member.ts
│   ├── store
│   │   ├── discussion.ts
│   │   ├── index.ts
│   │   ├── invitation.ts
│   │   ├── post.ts
│   │   ├── team.ts
│   │   ├── topic.ts
│   │   ├── user.ts
│   ├── confirm.ts
│   ├── context.ts
│   ├── env.js
│   ├── gtag.js
│   ├── notifier.ts
│   ├── sharedStyles.ts
│   ├── withAuth.tsx
│   ├── withLayout.tsx
│   ├── withStore.tsx
├── pages
│   ├── discussions
│   │   ├── detail.tsx
│   ├── settings
│   │   ├── create-team.tsx
│   │   ├── team-billing.tsx
│   │   ├── team-members.tsx
│   │   ├── team-profile.tsx
│   │   ├── your-profile.tsx
│   ├── topics
│   │   ├── detail.tsx
│   ├── _document.tsx
│   ├── invitation.tsx
│   ├── login.tsx
├── server
│   ├── app.ts
│   ├── routesWithSlug.ts
├── static
│   ├── robots.txt
├── .eslintrc.js
├── .gitignore
├── .npmignore
├── next.config.js
├── nodemon.json
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── yarn.lock
```
