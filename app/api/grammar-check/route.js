import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request) {
    if (!openai) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    try {
        const { text } = await request.json();

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a grammar and style checker. Improve the text for clarity, grammar, and readability.',
                },
                {
                    role: 'user',
                    content: `Please check and improve this text: "${text}". Provide the corrected version.`,
                },
            ],
            max_tokens: 1000,
        });

        const improvedText = completion.choices[0].message.content.trim();

        return NextResponse.json({ improvedText });
    } catch (error) {
        console.error('Grammar Check Error:', error);
        return NextResponse.json({ error: 'Failed to check grammar' }, { status: 500 });
    }
}