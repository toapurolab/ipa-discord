type Option<T> = T | null

function req<T>(value: Option<T>, info = undefined): T {
    if(value == undefined) {
        const e = new ReferenceError(`Required object is missing ${value}`)
        if(process.argv.includes("--verbose")) {
            console.error(e, info)
        }
        throw e;
    }
    return value;
}

function reqTransform<T, R>(value: Option<T>, transformer: (v: T) => R, info = undefined): R {
    return req(
        transformer(req(value, info)),
        info
    );
}

export class QuestionOption {
    id: string
    text: string

    constructor(id: string, text: string) {
        this.id = id;
        this.text = text;
    }

    static tryParse(object: any): Option<QuestionOption> {
        if(!object["id"]) return null;

        return new QuestionOption(
            req(object["id"], object),
            req(object["text"], object)
        )
    }
}

export class Question {
    id: number
    from: string
    text: string
    options: QuestionOption[]
    correct: string
    explanation: string


    constructor(id: number, from: string, text: string, options: QuestionOption[], correct: string, explanation: string) {
        this.id = id;
        this.from = from;
        this.text = text;
        this.options = options;
        this.correct = correct;
        this.explanation = explanation;
    }

    static parse(object: any, from: string): Option<Question> {
        return new Question(
            reqTransform(object["qNo"], parseInt, object),
            from,
            req(object["text"], object),
            reqTransform<string[], QuestionOption[]>(object["options"], this.parseOptions, object),
            req(object["correctOption"], object),
            req(object["explanation"])
        )
    }

    static parseOptions(object: any): QuestionOption[] {
        if(object instanceof Array) {
            return object
                .map(QuestionOption.tryParse)
                .filter((v: any) => v as boolean)
                .map(v => v as QuestionOption)
        } else {
            const result = QuestionOption.tryParse(object)
            return result ? [result] : []
        }
    }
}