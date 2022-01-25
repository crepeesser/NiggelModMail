const discord = require("discord.js");
const client = new discord.Client()
const { prefix, ServerID, TOKEN } = require("./config.json")
const config = require('./config.json');
const messages = ['auf DMs' , 'Discord Usern zu' , 'auf euch' ];
let current = 1;

client.on("ready", () => {

    console.log("Modmail-Bot online")
    client.user.setActivity(messages[0] , {type: "WATCHING"})
    setInterval(() => {
    if(messages[current]){
    client.user.setActivity(messages[current] , {type: "WATCHING"})
    current++;
    }else{
      current = 0;
    client.user.setActivity(messages[current] , {type: "WATCHING"})
    }
    }, 5*1000)

})



client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("Mail Gelöscht", client.user.displayAvatarURL())
            .setColor('RED')
            .setDescription("Deine mail wurde vom Server Team gelöscht")
        return person.send(yembed)

    }


})

client.on("message", async message => {
    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();


    if (message.guild) {

        if (command == "setup") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Du benötigst Admin-Rechte, um das Modmail-System einzurichten! ")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Bot benötigt Admin-Berechtigungen, um das Modmail-System einzurichten! ")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Staff")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: Staff,
                        color: "YELLOW"
                    },
                    reason: "Staff Rolle benötigt für ModMail-System"
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "Hier werden alle Mails sein",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("Setup erfolgreich ✅")
        } else if (command == "close") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("Sie benötigen die Staff Rolle, um diesen Befehl zu verwenden ")
            }
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("Ich kann die Mail nicht schließen und dieser Fehler tritt auf, weil wahrscheinlich der Kanalname geändert wurde. ")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("Mail geschlossen", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setFooter("Mail wurde geschlosssen von " + message.author.username)
                if (args[0]) yembed.setDescription(`Weil: ${args.join(" ")}`)

                return person.send(yembed)

            }
        } else if (command == "open") {
            if (!message.content.startsWith(prefix)) return;
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("Auf diesem Server ist kein Modmail-System eingerichtet , benutze " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("Sie benötigen die Staff Rolle, um diesen Befehl zu verwenden")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send("Bitte geben Sie die ID des Users an")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send("Der User kann nicht gefunden werden.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "Mail wird direkt geöffnet von **" + message.author.username + "** Kontakt aufnehmen mit " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("Mail erstellt", target.user.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", target.user.username)
                .addField("Nachricht", target.user.displayAvatarURL({ dynamic: true }))
                .addField("Datum der Erstellung ", target.user.createdAt)
                .addField("Mail wurde vom Serverteam geöffnet");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("Mail erstellt")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Du wurdest von **" + message.guild.name + "** kontaktiert, bitte warte kurz ob weitere Nachrichten gesendet werden.");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Die Mail geöffnet : <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            if (!message.content.startsWith(prefix)) return;
            let embed = new discord.MessageEmbed()
                .setAuthor('MODMAIL BOT')
                .addField("m!setup", "Um das Modmail-System einzurichten.", "aber vorher musst du eine Rolle namens Staff erstellen", true)

                .addField("m!open", 'Lassen Sie die Mail öffnen, um jemanden mit seiner ID zu kontaktieren', true)
                .setThumbnail(client.user.displayAvatarURL())
                .addField("m!close", "Schließen Sie die Mail, in dem Sie diesen Befehl verwenden.", true);

            return message.channel.send(embed)

        }
    }







    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send('Nachricht konnte nicht gesendet werden')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)

            return member.send(lembed)
        }


    }

    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => { })
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "Mail kontakt mit **" + message.author.tag + "**"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("Mail erstellt")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Der Chat hat jetzt begonnen, Du wirst bald vom Serverteam kontaktiert. \n \n Habe Geduld!")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", message.author.username)
                .addField("Datum der Erstellung", message.author.createdAt)
                .addField("Mail von " + message.author.tag + " erstellt")


            return mx.send("<@&929395509544747018>",eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(message.content)


        main.send(xembed)

    }

})

client.login(TOKEN)
