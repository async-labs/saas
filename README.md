## SaaS Boilerplate

Open source web app that saves you many days of work when building your own SaaS product. The boilerplate comes with many basic SaaS features (see [Features](https://github.com/async-labs/saas#features) below) so that you can focus on features that differentiate your product.

Open source project is located in the `saas` folder. If you purchased our book, codebases for book's chapters are located in the `book` folder.

## Live demo:

- APP: https://saas-app.builderbook.org
- API: https://saas-api.builderbook.org

## Contents

- [Features](#features)
- [Run locally](#running-api-locally)
- [Stage locally](#stage-apps-locally-with-docker)
- [Deploy](#deploy-with-heroku)
- [Built with](#built-with)
- [Screenshots](#screenshots)
- [Showcase](#showcase)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)
- [Project structure](#project-structure)

## Features

- Server-side rendering for [fast initial load and SEO](https://async-await.com/article/server-side-vs-client-side-rendering-in-react-apps).
- User authentication with Google OAuth API and Passwordless, cookie, and session.
- Production-ready Express server with compression, parser, and helmet.
- Transactional emails (`AWS SES`): welcome, team invitation, and payment.
- Adding email addresses to newsletter lists (`Mailchimp`): new users, paying users.
- File upload, load, and deletion (`AWS S3`) with pre-signed request for: Posts, Team Profile, and User Profile.
- Websockets with socket.io v3.
- Team creation, Team Member invitation, and settings for Team and User.
- Opinionated architecture:
  - keeping babel and webpack configurations under the hood,
  - striving to minimize number of configurations,
  - `withAuth` HOC to pass user prop and control user access to pages,
  - HOC extensions `MyApp` and `MyDocument`
  - server-side rendering with `Material-UI`,
  - model-specific components in addition to common components.
- Universally-available environmental variables at runtime.
- Custom logger (configure what _not_ to print in production).
- Useful components for any web app: `ActiveLink`, `Confirm`, `Notifier`, `MenuWithLinks`, and more.
- Analytics with `Google Analytics`.
- Production-ready, scalable architecture:
  - `app` - user-facing web app with Next/Express server, responsible for rendering pages (either client-side or server-side rendered). `app` sends requests via API methods to `api` Express server.
  - `api` - server-only code, Express server, responsible for processing requests for internal and external API infrastructures.
  - we prepared both apps for easy deployment to `now` by Zeit.
- **Subscriptions with `Stripe`**:
  - subscribe/unsubscribe Team to plan,
  - update card information,
  - verified Stripe webhook for failed payment for subscription.

#### Running `api` locally:

- Before running, create a `.env` file inside the `api` folder with the environmental variables listed below.<br/>
  This file _must_ have values for the `required` variables.<br/>
  To use all features and third-party integrations, also add the `optional` variables. <br/>

  `api/.env`:

  ```
  # Used in api/server/server.ts
  MONGO_URL=
  SESSION_NAME=
  SESSION_SECRET=
  COOKIE_DOMAIN=

  # Used in api/server/google.ts
  GOOGLE_CLIENTID=
  GOOGLE_CLIENTSECRET=

  # Used in api/server/aws-s3.ts and api/server/aws-ses.ts
  AWS_ACCESSKEYID=
  AWS_SECRETACCESSKEY=

  # Used in api/server/models/Invitation.ts and api/server/models/User.ts
  EMAIL_SUPPORT_FROM_ADDRESS=

  # Used in api/server/mailchimp.ts
  MAILCHIMP_API_KEY=
  MAILCHIMP_REGION=
  MAILCHIMP_SAAS_ALL_LIST_ID=

  # All env variables above this line are needed for successful user signup

  # Used in api/server/stripe.ts
  STRIPE_TEST_SECRETKEY=sk_test_xxxxxx
  STRIPE_LIVE_SECRETKEY=sk_live_xxxxxx

  STRIPE_TEST_PLANID=plan_xxxxxx
  STRIPE_LIVE_PLANID=plan_xxxxxx

  STRIPE_LIVE_ENDPOINTSECRET=whsec_xxxxxx

  # Optionally determine the URL
  URL_APP=http://localhost:3000
  URL_API=http://localhost:8000
  PRODUCTION_URL_API=
  PRODUCTION_URL_APP=

  # in pages/_document.tsx and lib/withAuth.tsx
  GA_MEASUREMENT_ID=
  ```

  Important: The above environmental variables are available on the server only. You should add your `.env` file to `.gitignore` inside the `api` folder so that your secret keys are not stored on a remote Github repo.

  - To get `MONGO_URL`, we recommend you run `yarn stage:db` to spawn a database locally or a [free MongoDB at mLab](https://docs.mlab.com/).
  - Specify your own name and secret keys for Express session: [SESSION_NAME](https://github.com/expressjs/session#name) and [SESSION_SECRET](https://github.com/expressjs/session#express)
  - Get `GOOGLE_CLIENTID` and `GOOGLE_CLIENTSECRET` by following the [official OAuth tutorial](https://developers.google.com/identity/sign-in/web/sign-in#before_you_begin). <br/>
    Important: For Google OAuth app, callback URL is: http://localhost:8000/oauth2callback <br/>
    Important: You have to enable Google+ API in your Google Cloud Platform account.

- Once `.env` is created, you can run the `api` app. Navigate to the `api` folder, run `yarn install` to add all packages, then run the command below:
  ```
  yarn dev
  ```

#### Running `app` locally:

- Navigate to the `app` folder, run `yarn` to add all packages, then run `yarn dev` and navigate to `http://localhost:3000`:

  - A `.env` file in the `app` folder is not required to run, but you can create one to override the default variables:

  ```
    STRIPE_TEST_PUBLISHABLEKEY=pk_test_xxxxxxxxxxxxxxx
    STRIPE_LIVE_PUBLISHABLEKEY=pk_live_xxxxxxxxxxxxxxx

    BUCKET_FOR_POSTS=
    BUCKET_FOR_TEAM_AVATARS=
    BUCKET_FOR_TEAM_LOGOS=

    URL_APP=http://localhost:3000
    URL_API=http://localhost:8000
    PRODUCTION_URL_API=
    PRODUCTION_URL_APP=

    API_GATEWAY_ENDPOINT=
    GA_MEASUREMENT_ID=
  ```

  - To get `GA_MEASUREMENT_ID`, set up Google Analytics and follow [these instructions](https://support.google.com/analytics/answer/1008080?hl=en) to find your tracking ID.
  - To get `STRIPE_TEST_PUBLISHABLEKEY`, go to your Stripe dashboard, click `Developers`, then click `API keys`.

- For successful file uploading, make sure your buckets have proper CORS configuration. Go to your AWS account, find your bucket, go to `Permissions > CORS configuration`, add:

  ```
  <?xml version="1.0" encoding="UTF-8"?>
  <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
      <AllowedOrigin>http://localhost:3000</AllowedOrigin>
      <AllowedOrigin>https://saas-app.builderbook.org</AllowedOrigin>
      <AllowedMethod>POST</AllowedMethod>
      <AllowedMethod>GET</AllowedMethod>
      <AllowedMethod>PUT</AllowedMethod>
      <AllowedMethod>DELETE</AllowedMethod>
      <AllowedMethod>HEAD</AllowedMethod>
      <ExposeHeader>ETag</ExposeHeader>
      <ExposeHeader>x-amz-meta-custom-header</ExposeHeader>
      <AllowedHeader>*</AllowedHeader>
  </CORSRule>
  </CORSConfiguration>
  ```

- Make sure to update allowed origin with your actual values for `URL_APP` and `PRODUCTION_URL_APP`.

- Once `.env` is created, you can run the `app` app. Navigate to the `app` folder, run `yarn install` to add all packages, then run the command below:
  ```
  yarn dev
  ```

## Deploy with Heroku

To deploy the two apps (`api` and `app`), you can follow these instructions to deploy each app individually to Heroku:

https://github.com/builderbook/builderbook/blob/master/README.md#deploy-to-heroku

You are welcome to deploy to any cloud provider. Eventually, we will publish a tutorial for AWS Elastic Beanstalk.

If you need help deploying your SaaS Boilerplate app, or variation of it, you can hire us. Email us for more details: team@async-await.com.

## Built with

- [React](https://github.com/facebook/react)
- [Material-UI](https://github.com/mui-org/material-ui)
- [Next](https://github.com/zeit/next.js)
- [MobX](https://github.com/mobxjs/mobx)
- [Express](https://github.com/expressjs/express)
- [Mongoose](https://github.com/Automattic/mongoose)
- [MongoDB](https://github.com/mongodb/mongo)
- [Typescript](https://github.com/Microsoft/TypeScript)

For more detail, check `package.json` files in both `app` and `api` folders and project's root.

To customize styles, check [this guide](https://github.com/builderbook/builderbook#add-your-own-styles).

## Screenshots

Google or passwordless login:
![1_SaaS_login](https://user-images.githubusercontent.com/26158226/61417504-2760b000-a8ac-11e9-8ce6-14fc5947dad0.png)

Dropdown menu for settings:
![2_SaaS_DropdownMenu](https://user-images.githubusercontent.com/26158226/61417505-27f94680-a8ac-11e9-9390-35e17e1626c3.png)

Personal settings:
![3_SaaS_PersonalSettings](https://user-images.githubusercontent.com/26158226/61417514-2891dd00-a8ac-11e9-97d4-53944fe8f897.png)

Team settings:
![4_SaaS_TeamSettings](https://user-images.githubusercontent.com/26158226/61417515-2891dd00-a8ac-11e9-9c08-0d1adef43c5b.png)

Creating a Discussion:
![5_SaaS_Discussion_Creation](https://user-images.githubusercontent.com/26158226/61417509-27f94680-a8ac-11e9-889b-19f96b159d21.png)

Writing a Post, Markdown vs. HTML view:
![6_SaaS_Discussion_Markdown](https://user-images.githubusercontent.com/26158226/61417508-27f94680-a8ac-11e9-93fd-766014132e8d.png)

![7_SaaS_Discussion_HTML](https://user-images.githubusercontent.com/26158226/61417507-27f94680-a8ac-11e9-8058-d3701ef1696d.png)

Discussion between team members:
![8_SaaS_Discussion_Dark](https://user-images.githubusercontent.com/26158226/61417506-27f94680-a8ac-11e9-9cba-cc47ba3b51a8.png)

Billing settings:
![9_SaaS_Billing](https://user-images.githubusercontent.com/26158226/61417513-2891dd00-a8ac-11e9-9e3d-bcbcdfe5b5af.png)

Purchasing a subscription:
![10_SaaS_BuySubscription](https://user-images.githubusercontent.com/26158226/103588107-6407d900-4e9d-11eb-9159-e85301205739.png)

Payment history:
![12_SaaS_PaymentHistory](https://user-images.githubusercontent.com/26158226/61417510-27f94680-a8ac-11e9-88d1-1eef120dcc34.png)

## Showcase

Check out projects built with the code in this open source app. Feel free to add your own project by creating a pull request.

- [Retaino](https://retaino.com) by [Earl Lee](https://github.com/earllee) : Save, annotate, review, and share great web content. Receive smart email digests to retain key information.
- [Builder Book](https://github.com/builderbook/builderbook): Open source web app to publish documentation or books. Built with React, Material-UI, Next, Express, Mongoose, MongoDB.
- [Harbor](https://github.com/builderbook/harbor): Open source web app that allows anyone with a Gmail account to automatically charge for advice sent via email.
- [Async](https://async-await.com/): asynchronous communication for small teams of software engineers.


## Contributing

Want to support this project? Sign up at [async](https://async-await.com) and/or buy our [book](https://builderbook.org/book), which teaches you how to build this project from scratch (currently available for [pre-order](https://builderbook.org/books/saas-boilerplate/introduction-project-structure) at 60% off).

## Team

- [Kelly Burke](https://github.com/klyburke)
- [Delgermurun Purevkhuu](https://github.com/delgermurun)
- [Timur Zhiyentayev](https://github.com/tima101)

You can contact us at team@async-await.com.

## License

All code in this repository is provided under the [MIT License](https://github.com/async-labs/saas/blob/master/LICENSE.md).

## Project structure

```
├── .elasticbeanstalk
│   └── config.yml
├── .github
│   └── FUNDING.yml
├── .vscode
│   ├── extensions.json
│   ├── launch.json
│   └── settings.json
├── api
│   ├── .elasticbeanstalk
│   │   └── config.yml
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
│   │   │   ├── Team.ts
│   │   │   └── User.ts
│   │   ├── utils
│   │   │   ├── slugify.ts
│   │   │   └── sum.ts
│   │   ├── aws-s3.ts
│   │   ├── aws-ses.ts
│   │   ├── env.ts
│   │   ├── google-auth.ts
│   │   ├── logger.ts
│   │   ├── mailchimp.ts
│   │   ├── passwordless-auth.ts
│   │   ├── passwordless-token-mongostore.ts
│   │   ├── server.ts
│   │   ├── sockets.ts
│   │   └── stripe.ts
│   ├── static
│   │   └── robots.txt
│   ├── test/server/utils
│   │   ├── slugify.test.ts
│   │   └── sum.test.ts
│   ├── .eslintignore
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.server.json
│   └── yarn.lock
├── app
│   ├── .elasticbeanstalk
│   │   └── config.yml
│   ├── components
│   │   ├── common
│   │   │   ├── Confirmer.tsx
│   │   │   ├── LoginButton.tsx
│   │   │   ├── MemberChooser.tsx
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
│   │   ├── posts
│   │   │   ├── PostContent.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   └── PostForm.tsx
│   │   ├── teams
│   │   │   └── InviteMember.tsx
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
│   │   ├── isMobile.ts
│   │   ├── notify.ts
│   │   ├── resizeImage.ts
│   │   ├── sharedStyles.ts
│   │   ├── theme.ts
│   │   └── withAuth.tsx
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── billing.tsx
│   │   ├── create-team.tsx
│   │   ├── discussion.tsx
│   │   ├── invitation.tsx
│   │   ├── login-cached.tsx
│   │   ├── login.tsx
│   │   ├── team-settings.tsx
│   │   └── your-settings.tsx
│   ├── public
│   │   └── pepe.jpg
│   ├── server
│   │   ├── robots.txt
│   │   ├── routesWithCache.ts
│   │   ├── server.ts
│   │   └── setupSitemapAndRobots.ts
│   ├── .babelrc
│   ├── .eslintignore
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── next.env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.server.json
│   └── yarn.lock
├── book
├── lambda
│   ├── .estlintignore
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── api
│   ├── handler.ts
│   ├── package.json
│   ├── serverless.yml
│   ├── tsconfig.json
│   └── yarn.lock
├── .gitignore
├── LICENSE.md
├── README.md
├── docker-compose.yml
├── mongo-user.sh
├── package.json
├── yarn.lock
```
