import {IpaContext} from "../assets/context";

async function test() {
    const context = new IpaContext("./assets/questions/")

    await context.load()
}

test()