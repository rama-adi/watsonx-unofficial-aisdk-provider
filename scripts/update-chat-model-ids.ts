import type {APIResponse} from "./index.ts";
import {readFile, writeToFile} from "./write-to-file.ts";
import {createCodegen} from "./create-codegen.ts";

export async function updateChatModelIds(models: APIResponse) {
    const PATH = "models/chat-models/watsonx-chat-language-model-settings.ts";

    const chatModel = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .flatMap((resource) => `    | '${resource.model_id}'`)
        .concat("    | (string & {})")
        .join("\n");

    const fnCallingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .filter((resource) => resource.task_ids?.includes("function_calling"))
        .map(model => model.model_id);

    const oldContent = await readFile(PATH);
    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "watsonx-chat-model-ids",
        markerType: "js",
        description: "All of the supported models fetched from watsonx API. This only take account non-deprecated models.",
        content: [
            "// Models here can be called from the /chat endpoint",
            "// and supports the `CoreMessage[]` type",
            "export type WatsonxChatModelId =",
            chatModel,


            "",

            "// Some chat models support function calling",
            "export const functionCallingModels = [",
            "  " + fnCallingModels.map(id => `    '${id}'`).join(',\n  '),
            "] as const",
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: PATH,
        content: settingsAutogen
    });
}