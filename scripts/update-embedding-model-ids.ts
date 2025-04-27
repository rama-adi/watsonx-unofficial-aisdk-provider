import type {APIResponse} from "./index.ts";
import path from "path";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {createCodegen} from "./create-codegen.ts";
import {readFile, writeToFile} from "./write-to-file.ts";

export async function updateEmbeddingModelIds(models: APIResponse) {
    const PATH = "models/embedding-models/watsonx-embedding-model-settings.ts";
    const embeddingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .flatMap((resource) => `    | '${resource.model_id}'`)
        .concat("    | (string & {})")
        .join("\n");

    const oldContent = await readFile(PATH);
    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "watsonx-embedding-model-ids",
        markerType: "js",
        description: "All of the supported embedding models fetched from watsonx API. This only take account non-deprecated models.",
        content: [
            "// Supported embedding models",
            "export type WatsonxEmbeddingModelId =",
            embeddingModels,
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: PATH,
        content: settingsAutogen
    });
}