var StatsD = require('hot-shots')

export const dogstatsd = new StatsD({
    port: 8125,
    globalTags: { env: process.env.NODE_ENV }
});