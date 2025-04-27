import { streamText } from 'ai';
import chalk from 'chalk';
import { watsonx } from './watsonx';
async function main() {
    const streamModel = streamText({
        model: watsonx("ibm/granite-3-8b-instruct"),
        system: "You are a helpful assistant.",
        messages: [
            { role: "user", content: "Write a fun poem" }
        ]
    });

    console.log("Stream started");
    for await (const textPart of streamModel.textStream) {
        
        process.stdout.write(textPart);
    }
    console.log("\nStream finished");
}

main();