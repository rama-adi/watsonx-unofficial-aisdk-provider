import path from "path"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { createCodegen } from "./create-codegen"
import { getModels } from "./get-models";

async function main() {
    const models = await getModels();

    const chatModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .flatMap((resource) => {
            const supportsFunctionCalling = resource.task_ids?.includes("function_calling");
            const fcSo = supportsFunctionCalling ? "✅" : "❌";
            return [`| \`${resource.model_id}\` | ${resource.provider} | ${fcSo} |`];
        })
        .join("\n");

    const embeddingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "embedding"))
        .flatMap((resource) => `| \`${resource.model_id}\` | ${resource.provider} | ${resource.model_limits?.max_sequence_length ?? "N/A"} | ${resource.model_limits?.embedding_dimension ?? "N/A"}`)
        .join("\n");

    const textGenModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) =>
            resource.functions.some(res => res.id === "text_generation") &&
            !resource.functions.some(res => res.id === "text_chat")
        )
        .flatMap((resource) => `| \`${resource.model_id}\` | ${resource.provider} |`)
        .join("\n");


    // Read and update the file
    const settingsPath = path.join(__dirname, '..', 'README.md');
    let content = '';

    try {
        content = readFileSync(settingsPath, 'utf-8');
    } catch (error) {
        console.error('Could not read watsonx-settings.ts, creating new file');
    }

    const settingsAutogen = createCodegen({
        base: content,
        id: "watsonx-supported-models",
        markerType: "html",
        description: "All of the supported models fetched from watsonx API. This only take account non-deprecated models.",
        content: [
            "### Chat Models: ",
            "",
            "| ID | Provider | Function Calling & Structured Outputs |",
            "|----|----------|---------------------------------------|",
            chatModels,
            "",
            "> *Structured output sends a function that's force-run to generate the expected schema output. It requires model that supports function calling.*",


            "",
            "### Embedding Models: ",
            "",
            "| ID | Provider | Max Sequence Length | Embedding Dimensions |",
            "|----|----------|---------------------|----------------------|",
            embeddingModels,


            "",
            "### Text generation Models: ",
            "This model does not use the chat endpoint, as such `CoreMessage[]` type is not supported. You have to send the appropriate tokens yourself.",
            "",
            "| ID | Provider |",
            "|----|----------|",
            textGenModels,

        ],
        append: "\n"
    });

    // Ensure directory exists
    const typesDir = path.dirname(settingsPath);
    if (existsSync(typesDir)) {
        mkdirSync(typesDir, { recursive: true });
    }

    writeFileSync(settingsPath, settingsAutogen, 'utf-8');
    console.log("Updated model types in src/types/watsonx-settings.ts");
}

main();