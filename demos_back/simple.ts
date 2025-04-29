import { generateText } from "ai";
import { watsonx } from "./watsonx";

async function main() {

    const result = await generateText({
        model: watsonx("mistralai/mixtral-8x7b-instruct-v01"),
        prompt: 'Hello how are you?',
    });

   console.log(result.text)
}

main();