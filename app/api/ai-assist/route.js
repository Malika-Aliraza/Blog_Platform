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
        const { prompt, currentText } = await request.json();

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI writing assistant for blog posts. Help users write engaging content.',
                },
                {
                    role: 'user',
                    content: `Current text: "${currentText}". Prompt: ${prompt}. Please generate or improve the text based on the prompt.`,
                },
            ],
            max_tokens: 500,
        });

        const generatedText = completion.choices[0].message.content.trim();

        return NextResponse.json({ text: generatedText });
    } catch (error) {
        console.error('AI Assist Error:', error);
        return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
    }
}