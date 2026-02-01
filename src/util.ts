import {Message, OmitPartialGroupDMChannel} from "discord.js";

export type Optional<T> = T | undefined | null
export type TextMessage = OmitPartialGroupDMChannel<Message<boolean>>
