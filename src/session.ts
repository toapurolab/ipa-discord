import {Question} from "./assets/question";
import {Low} from "lowdb";
// To suppress ERR_PACKAGE_PATH_NOT_EXPORTED
// TODO: fix this
// noinspection ES6PreferShortImport
import {JSONFile} from "../node_modules/lowdb/lib/adapters/node/JSONFile";
import {PathLike} from "node:fs";
import {Optional} from "./util";

interface DbSchema {
    sessions: Map<string, Question>
}

export class SessionManager {
    db: Low<DbSchema>

    constructor(filename: PathLike) {
        const adapter = new JSONFile<DbSchema>(filename)
        this.db = new Low<DbSchema>(adapter, this.getDefaultData())
    }

    getDefaultData() {
        return {
            sessions: new Map<string, Question>()
        }
    }

    getSessions(): Optional<any> {
        return this.db.data?.sessions
    }

    async openSession(refId: string, question: Question) {
        this.getSessions()[refId] = question
        await this.db.write()
    }

    async getSession(refId: string): Promise<Optional<Question>> {
        await this.db.read()
        return this.getSessions()[refId]
    }

    async closeSession(refId: string) {
        delete this.getSessions()[refId]
        await this.db.write()
    }
}