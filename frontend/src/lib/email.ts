import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';
const APP_NAME = 'Bansho';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  to,
  token,
  userName,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const greeting = userName ? `${userName}様` : 'お客様';

  try {
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `【${APP_NAME}】パスワードリセットのご案内`,
      html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0;">${greeting}</p>

    <p>パスワードリセットのリクエストを受け付けました。</p>

    <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">パスワードをリセット</a>
    </div>

    <p style="color: #666; font-size: 14px;">このリンクは1時間後に無効になります。</p>

    <p style="color: #666; font-size: 14px;">このメールに心当たりがない場合は、このメールを無視してください。パスワードは変更されません。</p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      ボタンが機能しない場合は、以下のURLをブラウザに直接貼り付けてください：<br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>

  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
    &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
  </p>
</body>
</html>
      `,
      text: `
${greeting}

パスワードリセットのリクエストを受け付けました。

以下のURLにアクセスして、新しいパスワードを設定してください：
${resetUrl}

このリンクは1時間後に無効になります。

このメールに心当たりがない場合は、このメールを無視してください。パスワードは変更されません。

---
${APP_NAME}
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
