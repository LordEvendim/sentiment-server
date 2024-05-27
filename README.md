# Click clarity AI

# tech stack

- `express`
  - `redis`
  - `mysql (drizzle-orm)`
  - `rabbitmq`

# modules

sometimes also called `services`

- `auth` -
  - handles email/username login workflows
  - sessions
- `authorization`
  - not used right now
  - in the future it will be used to manage user roles and premissions
- `cache`
  - not used right now
  - in the future it will be used to save and retrive objects form cache
- `discord`
  - used to send error notifications to a specific webhook, but turned out to be not stable. During cron jobs I ended up reaching ratelimits and eventually decided to discontinue it. We need to find a better solution. Maybe `Sentry + Slack`?
- `gemini`
  - used to generate ai insights and also keeps track on used tokens
- `google`
  - `google auth` - everthing related to google oauth flow
  - `google ads` - data source used to pull data both daily and inital(last four weeks)
  - `google analytics` - the same as Google Ads but for
- `logger`
  - wrapper around `winston` logger
- `message-broker`
  - handles RabbitMQ queues and tasks
  - created to make sure that some tasks will be eventually completed and in case of a server crash could be retried
  - currently work in progress, but it could be used to also control rate limits to 3rd party APIs
- `meta`
  - used to handle oauth flow and data pull from Meta (facebook + meta ads)
  - needs to be refactored. Some of the code should be transfered from `metaInsights` to `metaAds`
- `reporter`
  - used to aggregate data from different data sources (meta, google, etc...)
  - retrives only data that was specified in `MetricsConfig[]`
  - this data comes in two main formats
    - report - array of metrics
    - generative report - specially formatted string containing all specified metrics sorted and aggregated into weeks and specific data sources. First gets data using the standard `report` and then formats it
- `scheduler`
  - runs cron jobs
    - daily data pulls
    - weekly report genration
    - reset usage limits
    - etc...

# testing

There are no tests for now. Once we settle on the project scope and idea, we need to write integration tests.

There is a basic boilerplate infrastrucure to run tests and mock 3rd party requets, but it needs some imporovements.
In the past I used `vitest` as a test framework with `msw` for mocking 3rd party requests.

For setting-up services we can use `test containers` or `docker compose` (it needs a special config to not interfere with local env)
