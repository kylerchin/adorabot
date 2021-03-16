# Adora Bot

Adora bot is a general purpose bot aimed at Kpop Discord Servers. 
You can add it to your server by using this link:  https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot

The current features include:
 - Displaying the current YouTube View / Live & Dislike / Comment count in a discord embed
 ![YtStats Command Example with Dyanmite BTS music Video](https://user-images.githubusercontent.com/7539174/101548716-36dd0f00-3961-11eb-86c7-cebae7d43f9a.png)

 
 - Displaying live Billboard Poll scores and vote links
![Screenshot from 2021-03-06 20-29-30](https://user-images.githubusercontent.com/7539174/110228991-b45de000-7eba-11eb-9b27-33929a96ca3f.png)


- `a!autoban` Automatically bans user accounts known for raiding, racism, lgbtq+phobia, disruption of servers based on ban list reports. No extra configuration required, just `a!autoban on` and go!
![Autoban turning on](https://user-images.githubusercontent.com/7539174/111341783-12b35d00-8637-11eb-990a-2b9d356f3943.png)
Features in development:
- Graphing out Youtube and Spotify view counts into embeds with changable time
- Billboard, Gaon, and other music chart ranking into embeds
- Updating show times for bands / acts
- Upcoming release times for subscribed kpop acts
- Browsable directory of birthdays and anniverseries, subscribe to events in advance
- Webhook subscriptions for Twitter, Weverse, YouTube and other subscribed to data streams from artists and labels
- Reaction roles and moderation features
- Member profiles / birthday / other information directory
- Logging, anti-raid, verification, anti-spam, and small to large community safety features
- Autoresponders, embeds, auto-react
- Switching from storing everything in json to a highly compressed database in Cassandra, mapping CQL, creating a cluster and enabling the bot to be run off sharding
 
This bot is in beta, if you would like to contribute, open up an issue or Pull Request!

## Development information

[![forthebadge](https://forthebadge.com/images/badges/made-with-typescript.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/it-works-why.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/fuck-it-ship-it.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/for-you.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/contains-tasty-spaghetti-code.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/works-on-my-machine.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/you-didnt-ask-for-this.svg)](https://forthebadge.com)

This bot is designed to be horizontally scalable and fault-tolerent. What does that mean? It means no matter how many servers are added and commands are used, the system is designed to take advantage of using more cores and computers. There are parts of the project that need to be upgraded for that.

Here are the features that help it be fault tolerent:
- Sharding: This allows for the incoming commands from servers to be split across multiple cores or computers. The sharding application, `app.ts`, creates multiple bots, which are hosted inside `app.ts`. 
- Scylla DB: Syclla Database basically a faster version of cassandra. It is backwards compatible, so that's why you'll see the bot access the database using the driver `cassandra-driver`. It can replicate it's data across multiple machines and is designed for redundancy.

Things that need to be added to maintain this:
- Sharding needs to be upgraded to multi-host sharding. This means multiple computers in different locations should be able to host the bot.

- The Youtube API needs to be swapped out with a custom scrapper to avoid API limits if the bot gets too popular, or we'll need to upgrade the accounds

### Configuration File

The system uses `config.json` to access the api keys to access youtube, genius, the Scylla database, etc. You will need to copy it over from the example file `example.config.json` to set up this bot or it will not work.

### Compiling

When you make changes to the software, you'll first need to recompile to update the javascript to run. This is because you code in TypeScript and then compile to Javascript. This elimates a lot of problems that would break the bot during production and such. 

Install Typescript Globally via `npm install -g typescript`

You can test your install by checking the version or help file.
```
tsc --version
tsc --help
```

You can compile by typing `npm run compile`. 