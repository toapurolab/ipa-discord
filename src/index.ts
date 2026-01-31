import {Client, EmbedBuilder, GatewayIntentBits, TextChannel} from "discord.js"
import "dotenv/config"
import {IpaContext} from "./assets/context";
import {Question} from "./assets/question";

const targetChannelId = process.env.TARGET_CHANNEL

const questionMap: Map<string, Question> = new Map<string, Question>()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
})

const context = new IpaContext("./assets/questions/");
context.load().then(() => {
    console.log("Context loaded")
})

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`)
})

client.on("messageCreate", async msg => {
    if (msg.channel.id != targetChannelId) {
        return
    }

    if (msg.content == "!problem") {
        await showProblem(msg.channel as TextChannel)
        return
    }

    const refId = msg.reference?.messageId;
    if(refId) {
        if (msg.content == "!correct" || msg.content == "分からん") {
            const question = questionMap.get(refId)
            if(question == undefined) return

            await msg.channel.send(`# 問題#${question.id}\n正答: ${question.correct}\n## 解説\n\n${question.explanation}`)

            setTimeout(
                async () => await showProblem(msg.channel as TextChannel),
                2000
            )
            return
        }

        const question = questionMap.get(refId)
        if(question == undefined) return

        if(msg.content.includes(question.correct)) {
            await msg.react("⭕")
            await msg.reply("正解！")

            await msg.channel.send(`# 問題#${question.id}\n正答: ${question.correct}\n## 解説\n\n${question.explanation}`)

            setTimeout(
                async () => await showProblem(msg.channel as TextChannel),
                2000
            )
        } else {
            await msg.react("❌")
            await msg.reply("不正解")
        }
    }
})

async function showProblem(channel: TextChannel) {
    const questions = context.questions;
    const question = questions[Math.floor(Math.random() * questions.length)]


    const fields: any[] = []

    question.options.forEach(option => {
        fields.push({
            name: option.id,
            value: option.text
        })
    })

    const embed = new EmbedBuilder()
        .setTitle(`問題 #${question.id} from ${question.from}`)
        .setDescription(question.text)
        .setFields(fields)

    const result = await channel.send({ embeds: [embed] })

    questionMap.set(result.id.toString(), question)
}

client.login(`${process.env.DISCORD_TOKEN}`).then(() => {})