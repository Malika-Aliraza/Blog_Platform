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
        const { text, targetLanguage } = await request.json();

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a translator. Translate the given text to the specified language.',
                },
                {
                    role: 'user',
                    content: `Translate this text to ${targetLanguage}: "${text}"`,
                },
            ],
            max_tokens: 1000,
        });

        const translatedText = completion.choices[0].message.content.trim();

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Translation Error:', error);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}