## Boilerplate App for SaaS Product

Open source web app that saves you weeks of work when building your own SaaS product.

- The boilerplate app comes with many basic SaaS features (see [Features](https://github.com/async-labs/saas#features) below) so that you are able to focus on features that differentiate your product.
- We built this boilerplate for ourselves to focus more on what matters. We've used it to quickly launch [async](https://async-await.com), [builderbook](https://builderbook.org), and other real-world SaaS web apps.

## Live demo:

- https://saas-app.async-await.com

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

- Server-side rendering for [fast initial load and SEO](https://hackernoon.com/server-side-vs-client-side-rendering-in-react-apps-443efd6f2e87).
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
- Browser-side environmental variables managed with `Next.js` and `webpack`'s `process.env` substitution (see `./app/.env.blueprint`).
- Custom logger (configure what _not_ to print in production).
- Useful components for any web app: `ActiveLink`, `AutoComplete`, `Confirm`, `Notifier`, `MenuWithLinks`, and more.
- Analytics with `Google Analytics`.
- **`Docker CE` Integration**:
  - spawn `MongoDB` database for development.
  - stage service stack with lean container images.
- Production-ready, scalable architecture:
  - `app` - user-facing web app with Next/Express server, responsible for rendering pages (either client-side or server-side). `app` sends requests via API methods and fetch to `api` server's Express routes.
  - `api` - server-only web app with Express server, responsible for processing requests for internal and external APIs.
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
  # Used in api/server/app.ts
  MONGO_URL=mongodb://saas:secret@localhost:27017/saas
  SESSION_NAME=xxxxxx
  SESSION_SECRET=xxxxxx

  # Used in api/server/google.ts
  GOOGLE_CLIENTID=xxxxxx
  GOOGLE_CLIENTSECRET=xxxxxx

  # Used in api/server/aws-s3.ts and api/server/aws-ses.ts
  AMAZON_ACCESSKEYID=xxxxxx
  AMAZON_SECRETACCESSKEY=xxxxxx

  # Used in api/server/models/Invitation.ts and api/server/models/User.ts
  EMAIL_SUPPORT_FROM_ADDRESS=xxxxxx

  # Used in api/server/mailchimp.ts
  MAILCHIMP_API_KEY=xxxxxx
  MAILCHIMP_REGION=xxxx
  MAILCHIMP_SAAS_ALL_LIST_ID=xxxxxx

  # All env variables above this line are needed for successful user signup

  # Used in api/server/stripe.ts
  STRIPE_TEST_SECRETKEY=sk_test_xxxxxx
  STRIPE_LIVE_SECRETKEY=sk_live_xxxxxx

  STRIPE_TEST_PUBLISHABLEKEY=pk_test_xxxxxx
  STRIPE_LIVE_PUBLISHABLEKEY=pk_live_xxxxxx

  STRIPE_TEST_PLANID=plan_xxxxxx
  STRIPE_LIVE_PLANID=plan_xxxxxx

  STRIPE_LIVE_ENDPOINTSECRET=whsec_xxxxxx

  # Optionally determine the URL
  URL_APP=http://localhost:3000
  URL_API=http://localhost:8000
  COOKIE_DOMAIN=localhost
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
    STRIPEPUBLISHABLEKEY=pk_test_xxxxxxxxxxxxxxx
    BUCKET_FOR_POSTS=xxxxxx
    BUCKET_FOR_TEAM_AVATARS=xxxxxx
    LAMBDA_API_ENDPOINT=xxxxxxapi
    URL_APP=http://localhost:3000
    URL_API=http://localhost:8000
    GA_TRACKING_ID=
  ```

  - To get `GA_TRACKING_ID`, set up Google Analytics and follow [these instructions](https://support.google.com/analytics/answer/1008080?hl=en) to find your tracking ID.
  - To get `STRIPEPUBLISHABLEKEY`, go to your Stripe dashboard, click `Developers`, then click `API keys`.

- For successful file uploading, make sure your buckets have proper CORS configuration. Go to your AWS account, find your bucket, go to `Permissions > CORS configuration`, add:

  ```
  <?xml version="1.0" encoding="UTF-8"?>
  <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
      <AllowedOrigin>http://localhost:3000</AllowedOrigin>
      <AllowedOrigin>http://app.saas.localhost:3000</AllowedOrigin>
      <AllowedOrigin>https://saas-app.async-await.com</AllowedOrigin>
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

- Make sure to update allowed origin with your actual `URL_APP`. In our case, it's `https://saas-app.async-await.com` for production, `http://app.saas.localhost:3000` for staging locally and `http://localhost:3000` for development.

- Once `.env` is created, you can run the `app` app. Navigate to the `app` folder, run `yarn install` to add all packages, then run the command below:
  ```
  yarn dev
  ```

#### Run both app and api in the same shell

- Install dependencies: either run `yarn install --no-lockfile` at project's root or go to `app` and `api` folders and run `yarn install` in each folder.
- Add env variables as shown above, and then run `yarn dev` on the root of the project, it should initiate both `api` and `app` on the same shell. Alternatively, start each app in its own terminal shell by going to `app` and `api` folders and running `yarn dev` in each folder.

## Stage database for development with Docker

If you're not DB ready when starting the boilerplate, you can now spawn a mongo docker container with yarn stage:db on the root of the project that will configure a default database and users.

The [compose file](https://github.com/async-labs/saas/blob/master/docker-compose.yml) is configured to stage the db with default values, but you can override them with a new root .env file (more details below) containing the expected variables to launch a [mongo docker image](https://hub.docker.com/_/mongo/), and `mongo-express`. My recommended stage settings are:

```
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=supersecret
MONGO_INITDB_DATABASE=saas
MONGO_NON_ROOT_USERNAME=saas
MONGO_NON_ROOT_PASSWORD=secret

# mongo-express config
ME_CONFIG_MONGODB_SERVER=saas-mongo
ME_CONFIG_MONGODB_ADMINUSERNAME=root
ME_CONFIG_MONGODB_ADMINPASSWORD=supersecret
```

Once it starts you need to have `MONGO_URL=mongodb://saas:secret@localhost:27017/saas` connection string on your api/.env because the container exposes port 27017 to consume under localhost instead of being on the same network.

Please note the [docker-compose.yml](https://github.com/async-labs/saas/blob/master/docker-compose.yml) configuration includes a volume for `saas-mongo` that persists data to your local path `/tmp/saas-db` across container restarts.

## Stage apps locally with Docker

Use `docker-compose` to build a new stack of the services whenever you change dependencies, refactor, or you can also use this workflow if you don't want to install all the dependencies to build the stack.

Create the new root `.env` file (as shown bellow) and then run `yarn stage` on the project's root directory to build the images, and then `yarn stage:start` to start the containers. The app will be available on http://app.saas.localhost:3000.

On another shell run `yarn stage:stop` and `yarn stage:clean` to stop all the container and clean them.

With the containers running you can also `sh` into them by running `yarn sh:api` or `yarn sh:app`, there are other scripts, please have a look at the root's `project.json` file.

**Please note** the first time you run the stage, there maybe a connection timeout whilst the mongo instance creates the first database/user, if that's the case just restart the stack.

#### Example new root `.env` for staging with Docker

This file is optional and only if you would like to use `docker-compose` to stage the project.

```
# compose
COMPOSE_TAG_NAME=stage

# common to api and app (build and run)
LOG_LEVEL=notice
NODE_ENV=development
URL_APP=http://app.saas.localhost:3000
URL_API=http://api.saas.localhost:8000
API_PORT=8000
APP_PORT=3000

# api (run)
MONGO_URL=mongodb://saas:secret@saas-mongo:27017/saas
SESSION_NAME=saas.localhost.sid
SESSION_SECRET=3NvS3Cr3t!
COOKIE_DOMAIN=.saas.localhost
GOOGLE_CLIENTID=
GOOGLE_CLIENTSECRET=
AMAZON_ACCESSKEYID=
AMAZON_SECRETACCESSKEY=
EMAIL_SUPPORT_FROM_ADDRESS=
MAILCHIMP_API_KEY=
MAILCHIMP_REGION=
MAILCHIMP_SAAS_ALL_LIST_ID=
STRIPE_TEST_SECRETKEY=
STRIPE_LIVE_SECRETKEY=
STRIPE_TEST_PUBLISHABLEKEY=
STRIPE_LIVE_PUBLISHABLEKEY=
STRIPE_TEST_PLANID=
STRIPE_LIVE_PLANID=
STRIPE_LIVE_ENDPOINTSECRET=

# app (build and run)
STRIPEPUBLISHABLEKEY=
BUCKET_FOR_POSTS=
BUCKET_FOR_TEAM_AVATARS=
LAMBDA_API_ENDPOINT=
GA_TRACKING_ID=

# mongo config
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=supersecret
MONGO_INITDB_DATABASE=saas
MONGO_NON_ROOT_USERNAME=saas
MONGO_NON_ROOT_PASSWORD=secret

# mongo-express config
ME_CONFIG_MONGODB_SERVER=saas-mongo
ME_CONFIG_MONGODB_ADMINUSERNAME=root
ME_CONFIG_MONGODB_ADMINPASSWORD=supersecret
```

## Deploy with Heroku

To deploy the two apps (`api` and `app`), you can follow these instructions to deploy each app individually to Heroku:

https://github.com/builderbook/builderbook/blob/master/README.md#deploy-to-heroku

You are welcome to deploy to any cloud provider. Eventually, we will publish a tutorial for AWS Elastic Beanstalk.

## Built with

- [React](https://github.com/facebook/react)
- [Material-UI](https://github.com/mui-org/material-ui)
- [Next](https://github.com/zeit/next.js)
- [MobX](https://github.com/mobxjs/mobx)
- [Express](https://github.com/expressjs/express)
- [Mongoose](https://github.com/Automattic/mongoose)
- [MongoDB](https://github.com/mongodb/mongo)
- [Typescript](https://github.com/Microsoft/TypeScript)
- [Docker CE](https://docs.docker.com/install/)

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
![10_SaaS_BuySubscription](https://user-images.githubusercontent.com/26158226/61417512-2891dd00-a8ac-11e9-9a32-552e0468726e.png)

Add/Update card information:
![11_SaaS_AddEditCard](https://user-images.githubusercontent.com/26158226/61417511-2891dd00-a8ac-11e9-9f97-25a444639c08.png)

Payment history:
![12_SaaS_PaymentHistory](https://user-images.githubusercontent.com/26158226/61417510-27f94680-a8ac-11e9-88d1-1eef120dcc34.png)

## Showcase

Check out projects built with the code in this open source app. Feel free to add your own project by creating a pull request.

- [Async](https://async-await.com/): asynchronous communication for small teams of software engineers.
- [Retaino](https://retaino.com) by [Earl Lee](https://github.com/earllee) : Save, annotate, review, and share great web content. Receive smart email digests to retain key information.
- [Builder Book](https://github.com/builderbook/builderbook): Open source web app to publish documentation or books. Built with React, Material-UI, Next, Express, Mongoose, MongoDB.
- [Harbor](https://github.com/builderbook/harbor): Open source web app that allows anyone with a Gmail account to automatically charge for advice sent via email.

## Contributing

If you'd like to contribute, check our [todo list](https://github.com/async-labs/saas/issues/14) for features you can discuss and add. To report a bug, create an [issue](https://github.com/async-labs/saas/issues/new).

Want to support this project? Sign up at [async](https://async-await.com) and/or buy our [book](https://builderbook.org/book).

## Team

- [Kelly Burke](https://github.com/klyburke)
- [Delgermurun Purevkhuu](https://github.com/delgermurun)
- [Timur Zhiyentayev](https://github.com/tima101)

You can contact us at team@async-await.com.

If you want to hire us to customize or build features on top of our SaaS boilerplate, please fill out our [form](https://forms.gle/vaLHem6Ccmp3hics6).

## License

All code in this repository is provided under the [MIT License](https://github.com/async-labs/saas/blob/master/LICENSE.md).

## Project structure

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
│   ├── .dockerignore
│   ├── .env
│   ├── .gitignore
│   ├── .node-dev.json
│   ├── .npmignore
│   ├── Dockerfile
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
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
│   ├── .dockerignore
│   ├── .env
│   ├── .env.blueprint
│   ├── .gitignore
│   ├── .npmignore
│   ├── Dockerfile
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
├── .env
├── .gitignore
├── .prettierrc.js
├── LICENSE.md
├── README.md
├── docker-compose.yml
├── mongo-user.sh
└── package.json
```
