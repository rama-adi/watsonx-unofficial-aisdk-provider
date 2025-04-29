import { generateObject, streamObject } from 'ai';
import { z } from 'zod';
import { watsonx } from './watsonx';
import boxen from 'boxen';
import chalk from 'chalk';
import { select, input } from '@inquirer/prompts';
import ora from 'ora';

/**
 * Structured data demo
 * 
 * This demo showcases how to generate and stream structured data from LLMs using Zod schemas.
 * It implements a recipe generator that produces well-formatted recipe data including:
 * - Recipe name
 * - List of ingredients with amounts
 * - Step-by-step cooking instructions
 * 
 * The demo includes two modes:
 * 1. Non-streaming generation - Generates the complete recipe at once
 * 2. Streaming generation - Shows the recipe being generated in real-time
 * 
 * The structured output is enforced using Zod schemas to ensure type safety and
 * data validation. The results are displayed in a formatted console output with
 * colors and boxes for better readability.
 */

// llama 70b model is good for visualization of the streaming capabilities.
const MODEL = watsonx("meta-llama/llama-3-3-70b-instruct");

async function nonStreamingGeneration(recipe: string) {
    const spinner = ora('Generating recipe...').start();

    const { object } = await generateObject({
        model: MODEL,
        schema: z.object({
            recipe: z.object({
                name: z.string().default(""),
                ingredients: z.array(z.object({
                    name: z.string().default(""),
                    amount: z.string().default("")
                })),
                steps: z.array(z.string()).default([]),
            }),
        }),
        prompt: `Generate a ${recipe} recipe.`,
    });

    spinner.stop();

    // Display recipe header
    console.log(boxen(chalk.cyan('\n🍳 Recipe Generator 🍳\n'), {
        padding: 1,
        borderColor: 'cyan',
        title: chalk.yellow('Generated Recipe'),
        titleAlignment: 'center'
    }));

    // Display recipe name
    console.log(chalk.green(`\n📖 Recipe: ${object.recipe.name}`));

    // Display ingredients
    console.log(chalk.blue('\n🥘 Ingredients:'));
    object.recipe.ingredients.forEach((ing, index) => {
        console.log(chalk.yellow(`   ${index + 1}. ${ing.amount} ${ing.name}`));
    });

    // Display steps
    console.log(chalk.magenta('\n📝 Steps:'));
    object.recipe.steps.forEach((step, index) => {
        console.log(chalk.white(`   ${index + 1}. ${step}`));
    });
}

async function streamingGeneration(recipe: string) {
    let recipeName = "Processing...";
    let ingredients: { name: string, amount: string }[] = [];
    let steps: string[] = [];

    const spinner = ora('Generating recipe...').start();

    const result = streamObject({
        model: MODEL,
        schema: z.object({
            recipe: z.object({
                name: z.string().default(""),
                ingredients: z.array(z.object({
                    name: z.string().default(""),
                    amount: z.string().default("")
                })),
                steps: z.array(z.string()).default([]),
            }),
        }),
        prompt: `Generate a ${recipe} recipe.`,
    });

    // Display the recipe as it's being generated
    for await (const partialObject of result.partialObjectStream) {
        spinner.stop();
        console.clear(); // Clear previous output    

        // Get the current state
        recipeName = partialObject.recipe?.name ?? "Processing...";
        ingredients = (partialObject.recipe?.ingredients ?? []) as { name: string, amount: string }[];
        steps = (partialObject.recipe?.steps ?? []) as string[];

        // Create a nice display
        console.log(boxen(chalk.cyan('\n🍳 Recipe Generator 🍳\n'), {
            padding: 1,
            borderColor: 'cyan',
            title: chalk.yellow('Streaming Generation'),
            titleAlignment: 'center'
        }));

        // Display recipe name
        console.log(chalk.green(`\n📖 Recipe: ${recipeName}`));

        // Display ingredients
        console.log(chalk.blue('\n🥘 Ingredients:'));
        if (ingredients.length === 0) {
            console.log(chalk.gray('   Loading ingredients...'));
        } else {
            ingredients.forEach((ing, index) => {
                console.log(chalk.yellow(`   ${index + 1}. ${ing.amount} ${ing.name}`));
            });
        }

        // Display steps
        console.log(chalk.blue('\n📝 Steps:'));
        if (steps.length === 0) {
            console.log(chalk.gray('   Loading steps...'));
        } else {
            steps.forEach((step, index) => {
                console.log(chalk.yellow(`   ${index + 1}. ${step}`));
            });
        }

        spinner.text = 'Generating recipe... Please wait.';
        spinner.start();
    }

    spinner.stop();
}

async function main() {
    const recipe = await input({
        message: 'What recipe would you like to generate?',
    });

    const choice = await select({
        message: 'Choose a generation method:',
        choices: [
            { name: 'Non-Streaming Generation', value: 'non-streaming' },
            { name: 'Streaming Generation', value: 'streaming' },
        ],
    });

    if (choice === 'non-streaming') {
        await nonStreamingGeneration(recipe);
    } else {
        await streamingGeneration(recipe);
    }
}

main();