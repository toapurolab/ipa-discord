import * as fs from "node:fs";
import * as path from "node:path";
import {Question} from "./question";

export class IpaContext {
    questionsDir: string
    questions: Question[] = []

    constructor(questionsDir: string) {
        this.questionsDir = questionsDir
    }

    async load() {
        const papers = fs.readdirSync(this.questionsDir)

        const numPapers = papers.length;
        papers.forEach(paper => {
            const dirPath = path.join(this.questionsDir, paper)
            const questionsPath = path.join(dirPath, "questions_raw.json")

            const file = fs.readFileSync(questionsPath, "utf-8")
            const json = JSON.parse(file)

            try {
                if(json instanceof Array) {
                    this.loadQuestions(json, paper)
                        .forEach((q) => this.questions.push(q))
                } else {
                    console.error(`Could not load questions(type: ${typeof json}): `, questionsPath)
                }
            } catch (e) {
                console.error(`${questionsPath}: `, e)
            }
        })
        console.log(`Questions loaded ${this.questions.length} from ${numPapers} papers`)
    }

    loadQuestions(problems: any[], from: string): Question[] {
        const questions: Question[] = []
        for(const problem of problems) {
            try {
                const question = Question.parse(problem, from)
                if(question instanceof Question) {
                    questions.push(question)
                }
            } catch (e) {
                console.error(`Failed to parse questions:`, e)
            }
        }

        return questions;
    }
}