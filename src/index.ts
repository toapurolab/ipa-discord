import {Client, EmbedBuilder, GatewayIntentBits, Message, OmitPartialGroupDMChannel, TextChannel} from "discord.js"
import "dotenv/config"
import {IpaContext} from "./assets/context";
import {Question} from "./assets/question";

const targetChannelId = process.env.TARGET_CHANNEL

// snowflake to question
const questionSessions: Map<string, Question> = new Map<string, Question>()

type TextMessage = OmitPartialGroupDMChannel<Message<boolean>>

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
    if(await onMessageCreate(msg)) {
        return
    }

    const refId = msg.reference?.messageId;
    if (refId && await onMessageReplied(msg, refId)) {
    }
})

async function onMessageCreate(msg: TextMessage): Promise<Boolean> {
    if (msg.channel.id != targetChannelId) {
        return false
    }

    if (msg.content == "!problem") {
        await showProblem(msg.channel as TextChannel)
        return true
    }
    return false
}

async function onMessageReplied(msg: TextMessage, refId: string): Promise<Boolean> {
    if (msg.channel.id != targetChannelId) {
        return false
    }

    if (msg.content == "!correct" || msg.content == "解答") {
        const question = questionSessions.get(refId)
        if (question == undefined) return true

        await msg.channel.send(`# 問題#${question.id}\n正答: ${question.correct}\n## 解説\n\n${question.explanation}`)

        setTimeout(
            async () => await showProblem(msg.channel as TextChannel),
            2000
        )
        return true
    }

    const question = questionSessions.get(refId)
    if (question != undefined) {
        const correct = msg.content.includes(question.correct);
        await msg.react(correct ? "⭕" : "❌")

        if (correct) {
            await showCorrectAnswer(msg, question, refId)

            setTimeout(
                async () => await showProblem(msg.channel as TextChannel),
                2000
            )
        }
        return true
    } else {
        return false
    }
}

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

    questionSessions.set(result.id.toString(), question)
}

async function showCorrectAnswer(msg: TextMessage, question: Question, refId: string) {
    await msg.channel.send(`# 問題#${question.id}\n正答: ${question.correct}\n## 解説\n\n${question.explanation}`)
    questionSessions.delete(refId)
}

client.login(`${process.env.DISCORD_TOKEN}`).then(() => {})