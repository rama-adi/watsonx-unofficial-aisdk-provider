import path from "path"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { createCodegen } from "./create-codegen"
import { getModels } from "./get-models";



async function main() {
    const models = await getModels();

    const chatModel = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .flatMap((resource) => `  | '${resource.model_id}'`)
        .concat("  | (string & {})")
        .join("\n");

    const embeddingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "embedding"))
        .map((resource) => `  | '${resource.model_id}'`)
        .concat("  | (string & {})")
        .join("\n");


    const fnCallingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .filter((resource) => resource.task_ids?.includes("function_calling"))
        .map(model => model.model_id);

    const textCompletionModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) =>
            resource.functions.some(res => res.id === "text_generation") &&
            !resource.functions.some(res => res.id === "text_chat")
        )
        .flatMap((resource) => `  | '${resource.model_id}'`)
        .concat("  | (string & {})")
        .join("\n");

    // Read and update the file
    const settingsPath = path.join(__dirname, '..', 'src', 'types', 'watsonx-settings.ts');
    let content = '';

    try {
        content = readFileSync(settingsPath, 'utf-8');
    } catch (error) {
        console.error('Could not read watsonx-settings.ts, creating new file');
    }

    const settingsAutogen = createCodegen({
        base: content,
        id: "watsonx-settings-models",
        markerType: "js",
        description: "All of the supported models fetched from watsonx API. This only take account non-deprecated models.",
        content: [
            "// Models here can be called from the /chat endpoint",
            "// and supports the `CoreMessage[]` type",
            "export type WatsonxChatModelId =",
            chatModel,

            "",

            "// This is a traditional completion model",
            "// If you want QnA capabilities, you must supply the correct token",
            "// delimiter yourself in the prompt section",
            "export type WatsonxTextCompletionModelId =",
            textCompletionModels,

            "",


            "// All the embedding models",
            "export type WatsonxEmbeddingModelId =",
            embeddingModels,

            "",

            "// Some chat models support function calling",
            "export const functionCallingModels = [",
            "  " + fnCallingModels.map(id => `'${id}'`).join(',\n  '),
            "] as const"
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