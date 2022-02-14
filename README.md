
# Adora Bot

Adora bot is a general purpose bot aimed at Kpop Discord Servers.
You can add it to your server by using this link:  https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot

The current features include:
Displaying the current YouTube View / Live & Dislike / Comment count in a discord embed
![YtStats Command Example with Dyanmite BTS music Video](https://user-images.githubusercontent.com/7539174/101548716-36dd0f00-3961-11eb-86c7-cebae7d43f9a.png)

Displaying live Billboard Poll scores and vote links

![Screenshot from 2021-03-06 20-29-30](https://user-images.githubusercontent.com/7539174/110228991-b45de000-7eba-11eb-9b27-33929a96ca3f.png)

- `a!autoban` Automatically bans user accounts known for raiding, racism, lgbtq+phobia, disruption of servers based on ban list reports. No extra configuration required, just `a!autoban on` and go!

![Autoban turning on](https://user-images.githubusercontent.com/7539174/111886597-1a9f3400-898c-11eb-9c68-46a8704d9e66.png)

Inspect any user(s) using ID or mention. Runs with `a!inspect (userids)`

![Inspect User Command](https://user-images.githubusercontent.com/7539174/122634035-bb3ae800-d090-11eb-8b78-1113a95f9fc6.png)

Lyrics from Genius.com. Runs with `a!lyrics (searchterm)`

![Lyrics](https://user-images.githubusercontent.com/7539174/122634243-e7a33400-d091-11eb-9cf3-e9ca403aa5fc.png)

![QR Phishing](https://user-images.githubusercontent.com/7539174/115170970-cbc1e880-a076-11eb-808d-194d51e9da45.png)

Anti QR Phishing Feature: Automatically scans images for QR codes containing `discord.com/ra` and sends a warning message to the channel saying it is a phishing link and not to click on it.

![Detect Phishing Links in text](https://user-images.githubusercontent.com/7539174/151689252-0fbb4580-dc10-4297-b64a-d0fa4f8957f6.png)
Detect Phishing Links in text messages

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
- Anti QR Phishing block URL shorteners leading to `discord.com/ra` & ability to turn off Anti-qr code phishing.

If you would like to contribute, open up an issue or Pull Request!
Github: https://github.com/kylerchin/adorabot/

## Development information

This bot is designed to be horizontally scalable and fault-tolerent. What does that mean? It means no matter how many servers are added and commands are used, the system is designed to take advantage of using more cores and computers. There are parts of the project that need to be upgraded for that.

Here are the features that help it be fault tolerent:

- Sharding: This allows for the incoming commands from servers to be split across multiple cores or computers. The sharding application, `app.ts`, creates multiple bots, which are hosted inside `app.ts`.
- Scylla DB: Syclla Database basically a faster version of cassandra. It is backwards compatible, so that's why you'll see the bot access the database using the driver `cassandra-driver`. It can replicate it's data across multiple machines and is designed for redundancy.

You need to install scylla db, you can add as many nodes to scale as you want, and change the contact name and username and password in config.json. The bot will automagically make a keyspace called `adoramoderation` and 2 tables to store the guilds subscribed to autoban and the list of bans.

Things that need to be added to maintain this:

- Sharding needs to be upgraded to multi-host sharding. This means multiple computers in different locations should be able to host the bot.
- The Youtube API needs to be swapped out with a custom scrapper to avoid API limits if the bot gets too popular, or we'll need to upgrade the accounts linked to the API keys

### Configuration File

The system uses `config.json` to access the api keys to access youtube, genius, the Scylla database, etc. You will need to copy it over from the example file `example.config.json` to set up this bot or it will not work.

### Configuring SSL Keys via certbot

https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx#wildcard

Install via snap with cloudflare program

``sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini  -d api.adora.yk3music.com``

### Compiling

When you make changes to the software, you'll first need to recompile to update the javascript to run. This is because you code in TypeScript and then compile to Javascript. This elimates a lot of problems that would break the bot during production and such.

Install Typescript Globally via `npm install -g typescript`

Requirements for compilation, canvas is used to draw Adora's Youtube charts':

**Install this software for canvas https://www.npmjs.com/package/canvas**

You can test your install by checking the version or help file.

```
tsc --version
tsc --help
```

You can compile by typing `npm run compile`.

### list of tables that adora makes in cassandra / scylla

Keyspace `adorastats`

1. `ytvideostats`, stores individual points of data, like "BTS Dynamite had 1 Billion Views at Sep 1st 2021". Each video can have thousands of points depending on how often the points are added
2. `trackedytvideosids stores which youtube videos should be queried for views regularly`
3. `statpoints`, literally the number of ytvideostats there are , so SELECT COUNT(*) doesn't crash the whole system

### Font Dependencies

You need to install font dependencies for a lot of the canvas stuff to work, otherwise, EMPTY UNICODE BOXES!!!!

`sudo apt-get install fonts-arphic-uming fonts-ipafont-mincho ttf-wqy-zenhei ttf-unfonts-core fonts-takao fonts-dejavu ttf-mscorefonts-installer`

### Canvas Dependencies

[https://github.com/Automattic/node-canvas]()

Install the dependencies!!!! On ubuntu, run `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
