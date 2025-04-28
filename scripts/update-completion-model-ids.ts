import type {APIResponse} from "./index.ts";
import {readFile, writeToFile} from "./write-to-file.ts";
import {createCodegen} from "./create-codegen.ts";

export async function updateCompletionModelIds(models: APIResponse) {
    const PATH = "models/completion-models/watsonx-completion-model-settings.ts";

    const completionModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) =>
            resource.functions.some(res => res.id === "text_generation") &&
            !resource.functions.some(res => res.id === "text_chat")
        )
        .flatMap((resource) => `    | '${resource.model_id}'`)
        .concat("    | (string & {})")
        .join("\n");


    const oldContent = await readFile(PATH);
    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "watsonx-completion-model-ids",
        markerType: "js",
        description: "All of the supported completion models fetched from watsonx API. This only take account non-deprecated models.",
        content: [
            "// Models here can be called from the /chat endpoint",
            "// and supports the `CoreMessage[]` type",
            "export type WatsonxCompletionModelId =",
            completionModels,
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: PATH,
        content: settingsAutogen
    });
}