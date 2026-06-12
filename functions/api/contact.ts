import { Resend } from 'resend';

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const headers = { 'Content-Type': 'application/json' };

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'リクエストの形式が正しくありません' }),
      { status: 400, headers }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    typeof (body as Record<string, unknown>).email !== 'string' ||
    typeof (body as Record<string, unknown>).message !== 'string'
  ) {
    return new Response(
      JSON.stringify({ success: false, message: '必須項目が不足しています' }),
      { status: 400, headers }
    );
  }

  const { name, email, message } = body as { name: string; email: string; message: string };

  if (!name.trim() || !email.trim() || !message.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: '必須項目を入力してください' }),
      { status: 400, headers }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ success: false, message: 'メールアドレスの形式が正しくありません' }),
      { status: 400, headers }
    );
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = context.env;

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return new Response(
      JSON.stringify({ success: false, message: '送信設定が構成されていません' }),
      { status: 500, headers }
    );
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      subject: `【お問い合わせ】${name} 様より`,
      html: `
        <h2>お問い合わせが届きました</h2>
        <p><strong>お名前：</strong> ${escapeHtml(name)}</p>
        <p><strong>メール：</strong> ${escapeHtml(email)}</p>
        <hr />
        <p><strong>内容：</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
      replyTo: email,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: '送信に失敗しました。しばらくしてから再度お試しください。' }),
      { status: 500, headers }
    );
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
