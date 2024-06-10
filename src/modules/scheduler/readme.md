```ts
new CronJob(
  "10 3 * * *", // https://crontab.cronhub.io/
  jobs.fetchDailyDataJob, // job
  null, // onComplete
  true, // start
  "America/New_York" // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
),
```
