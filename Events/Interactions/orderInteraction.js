const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
const order = require("../../Schemas.js/orderSchema");
const { createTranscript } = require("discord-html-transcripts");
const { create } = require("../../Schemas.js/orderSchema");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("1177167453395099759")
      .catch(console.error);

    if (interaction.customId == "orderCreateSelect") {
      const modal = new ModalBuilder()
        .setTitle(`Start your order`)
        .setCustomId("orderModal");

      const nation = new TextInputBuilder()
        .setCustomId("nationOrder")
        .setRequired(true)
        .setPlaceholder("Do you belong to a group?")
        .setLabel("Do you belong to a group? If so which one?")
        .setStyle(TextInputStyle.Short);

      const info = new TextInputBuilder()
        .setCustomId("infoOrder")
        .setRequired(true)
        .setPlaceholder("Available options: Chicken, mutton, beef, pork chops")
        .setLabel("Place order here")
        .setStyle(TextInputStyle.Paragraph);

      const one = new ActionRowBuilder().addComponents(nation);
      const two = new ActionRowBuilder().addComponents(info);

      modal.addComponents(one, two);
      await interaction.showModal(modal);
    } else if (interaction.customId == "orderModal") {
      const user = interaction.user;
      const data = await order.findOne({ Guild: interaction.guild.id });
      if (!data)
        return await interaction.reply({
          content: `Sorry! Loooks like the ordering system is not setup yet`,
          ephemeral: true,
        });
      else {
        const nation = interaction.fields.getTextInputValue("nationOrder");
        const info = interaction.fields.getTextInputValue("infoOrder");
        const category = await interaction.guild.channels.cache.get(
          data.Category
        );

        const channel = await interaction.guild.channels.create({
          name: `order-${user.id}`,
          type: ChannelType.GuildText,
          topic: `Customer: ${user.username}; Nation: ${nation}`,
          parent: category,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: "1177167453395099759",
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
          ],
        });

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`Order for ${user.username}`)
          .setDescription(`Order: ${info}`)
          .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("closeOrder")
            .setLabel(`🔒 Close Order`)
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("orderTranscript")
            .setLabel("📃Transcript")
            .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [button] });
        await interaction.reply({
          content: `✨ Your order has been started in ${channel}`,
          ephemeral: true,
        });
      }
    } else if (interaction.customId == "closeOrder") {
      const closeModal = new ModalBuilder()
        .setTitle("Closing Order")
        .setCustomId("closeOrderModal");

      const reason = new TextInputBuilder()
        .setCustomId("closeSurveyOrder")
        .setRequired(false)
        .setPlaceholder(
          "Please write any comments on your experience with Fresh Meat Butchery"
        )
        .setLabel("Please tell us about your experience")
        .setStyle(TextInputStyle.Paragraph);

      const one = new ActionRowBuilder().addComponents(reason);

      closeModal.addComponents(one);
      await interaction.showModal(closeModal);
    } else if (interaction.customId == "closeOrderModal") {
      var channel = interaction.channel;
      var name = channel.name;
      name = name.replace("order-", "");
      const member = await interaction.guild.members.cache.get(name);

      const reason = interaction.fields.getTextInputValue("closeSurveyOrder");
      await interaction.reply({ content: `🔒 Closing this order...` });

      setTimeout(async () => {
        await channel.delete().catch((err) => {});
        await member
          .send(
            `📢 You are receiving this notification because your order in ${interaction.guild.name} have been closed. Thank you for shopping Fresh Meat Butchery!`
          )
          .catch((err) => {});
      }, 5000);
    } else if (interaction.customId == "orderTranscript") {
      const file = await createTranscript(interaction.channel, {
        limit: -1,
        returnBuffer: false,
        fileName: `${interaction.channel.name}.html`,
      });

      var msg = await interaction.channel.send({
        content: `📔 Your Transcript Cache:`,
        files: [file],
      });
      var message = `📜 **Here is your [order transcript](https://mahto.id/chat-exporter?url=${
        msg.attachments.first()?.url
      }) from ${interaction.guild.name}!**`;
      await msg.delete().catch((err) => {});
      await interaction.reply({ content: message, ephemeral: true });
    }
  },
};
