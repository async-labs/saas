### Setup

- [Install](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [setup](https://serverless.com/framework/docs/providers/aws/guide/credentials/) `serverless`.
- Install deps (run `yarn`).
- Create `.env` file. (required configs: `PRODUCTION_URL_APP`, `MONGO_URL_TEST`, `MONGO_URL`, `Amazon_accessKeyId`, `Amazon_secretAccessKey`, `EMAIL_SUPPORT_FROM_ADDRESS`)
- Also you can create `.env.production` file for production deploy.

### Deploy

- Development deploy: Run `sls deploy`
- Production deploy: Run `NODE_ENV=production sls deploy`
- If files did not change: Add `--force`
- Deploy particular function: `NODE_ENV=production sls deploy function --function sendEmailForNewPost`

### Testing (run/invoking)

- For invoking `sendEmailForNewPost` locally run `sls invoke local -l -f sendEmailForNewPost`.
- For invoking `sendEmailForNewPost` run `sls invoke -l -f sendEmailForNewPost`.
