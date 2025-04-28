import {streamText} from "ai";
import {watsonx} from "./watsonx.ts";

async function main() {
    let prompt = "Invent a new ice cream flavor inspired by a magical forest. The new ice cream flavor is called: ";

    const result = streamText({
        model: watsonx.completion("ibm/granite-13b-instruct-v2", {
            returnOptions: {
                inputText: true,
            },
            minNewTokens: 100
        }),
        prompt: prompt,
        maxTokens: 200,
    });

    console.log("Stream started");
    for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
    }
    console.log("\nStream finished");
}

main();