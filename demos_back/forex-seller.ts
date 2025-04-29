import { type ToolInvocation, type CoreMessage, generateText, tool } from 'ai';
import { createWatsonx } from '../src/provider';
import { z, ZodIssueCode } from 'zod';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import ora from 'ora';
import boxen from 'boxen';
import { watsonx } from './watsonx';

function renderChatLog(messages: CoreMessage[]) {
    // Only show user and assistant messages
    const chatLines = messages.filter(m => m.role !== 'system').map(m => {
        if (m.role === 'user') {
            return chalk.green('user: ') + chalk.green(m.content);
        } else if (m.role === 'assistant') {
            return chalk.blue('assistant: ') + chalk.blue(m.content);
        }
        return '';
    });
    return boxen(chatLines.join('\n'), {
        padding: 1,
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'cyan',
        title: 'Chat Log',
        titleAlignment: 'center',
    });
}

function renderToolCalls(tools: Record<string, number>) {
    const toolLines = Object.entries(tools).map(([name, count]) => {
        return `- ${name}: x${count}`;
    });

    return boxen(toolLines.join('\n'), {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'yellow',
        title: 'Tool Calls',
        titleAlignment: 'center',
    });
}
async function main() {
    let toolCalls: Record<string, number> = {};

    let messages: CoreMessage[] = [
        {
            role: "system",
            content: [
                "You are a customer service representative for PT Valuta Asing. You will assist users in purchasing foreign currency.",
                "As a customer service rep, use a friendly but natural tone, and don’t forget to greet the user.",
                "If the user is ready to make a payment but you don’t yet know their name (their name is not 'user'), ask for their name to be used during the payment process.",
                "Respond naturally as if replying to a chat message."
            ].join("\n")
        }
    ];

    console.clear();
    console.log(boxen(chalk.cyan.bold('🤖 Welcome to the AI Chat CLI DEMO!'), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        align: 'center',
        title: 'AI Chat CLI',
        titleAlignment: 'center',
    }));

    while (true) {
        console.log(renderChatLog(messages));
        console.log(renderToolCalls(toolCalls));

        const userInput = await input({
            message: chalk.green('💭 You:')
        });

        if (userInput.toLowerCase() === 'exit') {
            console.log(chalk.yellow('\nGoodbye! 👋'));
            // Show a summary of the conversation (excluding system message)
            const summary = messages.filter(m => m.role !== 'system').map(m => {
                if (m.role === 'user') {
                    return chalk.green('user: ') + chalk.green(m.content);
                } else if (m.role === 'assistant') {
                    return chalk.blue('assistant: ') + chalk.blue(m.content);
                }
                return '';
            }).join('\n');
            console.log(boxen(summary, {
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'magenta',
                title: 'Conversation Summary',
                titleAlignment: 'center',
            }));
            break;
        }

        messages.push({
            role: 'user',
            content: userInput
        });

        const spinner = ora({
            text: chalk.blue('🤔 Thinking...'),
            color: 'blue'
        }).start();

        const { text, toolCalled } = await send(messages);
        if (toolCalled !== "") {
            toolCalls[toolCalled] = (toolCalls[toolCalled] || 0) + 1;
        }
        spinner.stop();

        messages.push({
            role: "assistant",
            content: text
        });

        // After each turn, clear and re-render the chat log and chatbox
        console.clear();
        console.log(boxen(chalk.cyan.bold('🤖 Welcome to the AI Chat CLI!'), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'cyan',
            align: 'center',
            title: 'AI Chat CLI',
            titleAlignment: 'center',
        }));
    }
}

main().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
});

const FX_CHARGE = 1.015;

export async function send(messages: CoreMessage[]) {
    let toolCalled = "";

    const result = await generateText({
        model: watsonx("meta-llama/llama-3-3-70b-instruct"),
        messages,
        maxSteps: 5,
        tools: {
            getFxPrice: tool({
                description: "Gets the latest FX prices for the supported currency (includes 1.5% conversion charge)",
                parameters: z.object({
                    fx: z.enum(["EUR", "SGD", "USD", "THB", "MYR"]).describe("the FX that the user wants"),
                    amount: z.coerce.number().default(1).describe("The amount the user wants to see")
                }),
                execute: async ({ fx, amount }) => {
                    toolCalled = "getFxPrice";
                    const result = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fx.toLowerCase()}.json`);
                    const data = await result.json();
                    const baseRate = data[fx.toLowerCase()].idr;
                    const rateWithCharge = baseRate * FX_CHARGE;
                    const total = rateWithCharge * amount;
                    return `${amount} ${fx} = ${total.toLocaleString()} IDR (Rate: ${rateWithCharge.toLocaleString()} IDR/${fx}, includes 1.5% conversion charge)`;
                }
            }),
            getInverseFxPrice: tool({
                description: "Converts IDR to other supported currencies (includes 1.5% conversion charge)",
                parameters: z.object({
                    fx: z.enum(["EUR", "SGD", "USD", "THB", "MYR"]).describe("the target currency to convert IDR to"),
                    amount: z.coerce.number().default(1).describe("The amount in IDR to convert")
                }),
                execute: async ({ fx, amount }) => {
                    toolCalled = "getInverseFxPrice";
                    const result = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fx.toLowerCase()}.json`);
                    const data = await result.json();
                    const baseRate = data[fx.toLowerCase()].idr;
                    const rateWithCharge = baseRate * FX_CHARGE;
                    const convertedAmount = amount / rateWithCharge;
                    return `${amount.toLocaleString()} IDR = ${convertedAmount.toFixed(2)} ${fx} (Rate: ${rateWithCharge.toLocaleString()} IDR/${fx}, includes 1.5% conversion charge)`;
                }
            }),
            createPaymentLink: tool({

                description: "Creates the payment link for the FX that the user wants to purchase (includes 1.5% conversion charge)",
                parameters: z.object({
                    name: z.string().describe("The name of the buyer"),
                    currencies: z.preprocess(parseJsonPreprocessor, z.array(z.object({
                        fx: z.enum(["EUR", "SGD", "USD", "THB", "MYR"]).describe("the FX that the user wants"),
                        amount: z.coerce.number().min(1).describe("how much the user wants to purchase")
                    })).describe("the FX(s) the user wants to purchase"))
                }),
                execute: async ({ name, currencies }) => {
                    toolCalled = "createPaymentLink";
                    // Fetch all rates in parallel
                    const purchasedFxs = await Promise.all(currencies.map(async (purchase: { fx: string; amount: number }) => {
                        const result = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${purchase.fx.toLowerCase()}.json`);
                        const data = await result.json();
                        const baseRate = data[purchase.fx.toLowerCase()].idr;

                        return {
                            baseRate: baseRate,
                            paid: baseRate * purchase.amount * FX_CHARGE // Use consistent 1.5% charge
                        }
                    }));

                    // Calculate total paid amount
                    const total = purchasedFxs.reduce((acc: number, curr: { paid: number }) => acc + curr.paid, 0);

                    // Generate random ID
                    const id = Math.random().toString(36).substring(2, 15);

                    return {
                        url: `https://pay.example.com/${id}`,
                        total: total.toLocaleString()
                    };
                }
            })
        }
    });

    return {
        text: result.text,
        toolCalled
    };
}

const parseJsonPreprocessor = (value: any, ctx: z.RefinementCtx) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (e) {
            ctx.addIssue({
                code: ZodIssueCode.custom,
                message: (e as Error).message,
            });
        }
    }

    return value;
};