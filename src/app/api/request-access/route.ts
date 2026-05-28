import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'Inventori <onboarding@resend.dev>',
    to: process.env.RESEND_TO_EMAIL!,
    subject: `Access request from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      message ? `\nMessage:\n${message}` : '',
    ].join('\n').trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
