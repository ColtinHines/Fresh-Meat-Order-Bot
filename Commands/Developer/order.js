const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  Embed,
} = require("discord.js");
const order = require("../../Schemas.js/orderSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("order")
    .setDescription("Manage the ordering system")
    .addSubcommand((command) =>
      command
        .setName("send")
        .setDescription("Send the order message")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name for the open select menu content")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("A custom message to add to the embed")
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Setup the order category")
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("The category to send orders in")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("remove").setDescription("Disable the order system")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    const { options } = interaction;
    const sub = options.getSubcommand();
    const data = await order.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "send":
        if (!data)
          return await interaction.reply({
            content: `⚠️ You have to do /order setup before you can send an order message...`,
            ephemeral: true,
          });

        const name = options.getString("name");
        var message =
          options.getString("message") ||
          "Create an order with our butchery staff! Once you select below, use the input to select the amount of your order";

        const select = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("orderCreateSelect")
            .setPlaceholder(`🗒️ ${name}`)
            .setMinValues(1)
            .addOptions({
              label: "Start an order",
              description: "Click to start an order",
              value: "createOrder",
            })
        );

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("🗒️ Start an order!")
          .setDescription(message)
          .setFooter({
            text: `${interaction.guild.name}`,
          });

        await interaction.reply({
          content: `😊 I have sent your order message below.`,
          ephemeral: true,
        });
        await interaction.channel.send({
          embeds: [embed],
          components: [select],
        });

        break;
      case "remove":
        if (!data)
          return await interaction.reply({
            content: `⚠️ Looks like you don't already have the ordering system setup`,
            ephemeral: true,
          });
        else {
          await order.deleteOne({ Guild: interaction.guild.id });
          await interaction.reply({
            content: `🔥I have deleted your ticket category`,
            ephemeral: true,
          });
        }

        break;
      case "setup":
        if (data)
          return await interaction.reply({
            content: `⚠️ looks like you already have a ticket category set to <#${data.Category}>`,
            ephemeral: true,
          });
        else {
          const category = options.getChannel("category");
          await order.create({
            Guild: interaction.guild.id,
            Category: category.id,
          });
          await interaction.reply({
            content: `🌍 I have set the category to **${category}**! Use /order send to send an order create message`,
            ephemeral: true,
          });
        }
    }
  },
};
