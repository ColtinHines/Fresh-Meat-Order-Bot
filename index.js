const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./Handlers/eventHandler.js");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();

const { connect } = require("mongoose");
connect(client.config.DatabaseURL, {}).then(() =>
  console.log("Database Connected")
);

loadEvents(client);

client
  .login(client.config.TOKEN)
  .then(() => {
    console.log("I'm ready to start taking orders!");
    client.user.setActivity("taking orders");
  })
  .catch((err) => console.log(err));
