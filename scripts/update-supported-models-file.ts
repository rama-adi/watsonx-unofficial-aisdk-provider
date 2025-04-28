import type {APIResponse} from "./index.ts";
import {readFile, writeToFile} from "./write-to-file.ts";
import {createCodegen} from "./create-codegen.ts";

export async function updateSupportedModelsFile(models: APIResponse) {
    const PATH = "../supported-models.md";
    await updateChatModels((await readFile(PATH)), PATH, models);
    await updateEmbeddingModels((await readFile(PATH)), PATH, models);
    await updateTextgenModels((await readFile(PATH)), PATH, models);
}

async function updateChatModels(
    oldContent: string,
    path: string,
    models: APIResponse,
) {
    const chatModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "text_chat"))
        .flatMap((resource) => {
            const supportsFunctionCalling = resource.task_ids?.includes("function_calling");
            const fcSo = supportsFunctionCalling ? "✅" : "❌";
            return [`| \`${resource.model_id}\` | ${resource.provider} | ${fcSo} | ${fcSo} |`];
        })
        .join("\n");

    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "readme-chat-models",
        markerType: "html",
        description: "Chat models tables",
        content: [
            "| ID | Provider | Function Calling | Structured Outputs |",
            "|----|----------|------------------|--------------------|",
            chatModels,
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: path,
        content: settingsAutogen
    });
}

async function updateEmbeddingModels(
    oldContent: string,
    path: string,
    models: APIResponse,
) {
    const embeddingModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) => resource.functions.some(res => res.id === "embedding"))
        .flatMap((resource) => `| \`${resource.model_id}\` | ${resource.provider} | ${resource.model_limits?.max_sequence_length ?? "N/A"} | ${resource.model_limits?.embedding_dimension ?? "N/A"} |`)
        .join("\n");

    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "readme-embedding-models",
        markerType: "html",
        description: "Embedding models tables",
        content: [
            "| ID | Provider | Max Sequence Length | Embedding Dimensions |",
            "|----|----------|---------------------|----------------------|",
            embeddingModels,
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: path,
        content: settingsAutogen
    });
}

async function updateTextgenModels(
    oldContent: string,
    path: string,
    models: APIResponse,
) {
    const textGenModels = models
        .resources
        .filter((resource) => !resource.lifecycle.some(lifecycle => lifecycle.id === "deprecated"))
        .filter((resource) =>
            resource.functions.some(res => res.id === "text_generation") &&
            !resource.functions.some(res => res.id === "text_chat")
        )
        .flatMap((resource) => `| \`${resource.model_id}\` | ${resource.provider} |`)
        .join("\n");

    const settingsAutogen = createCodegen({
        base: oldContent,
        id: "readme-completion-models",
        markerType: "html",
        description: "Completion models tables",
        content: [
            "| ID | Provider |",
            "|----|----------|",
            textGenModels,
        ],
        append: "\n"
    });

    await writeToFile({
        filePath: path,
        content: settingsAutogen
    });
}