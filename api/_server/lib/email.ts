import nodemailer from 'nodemailer';

interface InvitationEmailParams {
  to: string;
  inviterName: string | null;
  inviterEmail: string;
  tripName: string;
  role: string;
  invitationId: string;
  baseUrl: string;
}

interface SendResult {
  success: boolean;
  error?: string;
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'editor': return '편집자';
    case 'viewer': return '뷰어';
    default: return role;
  }
}

function buildInvitationHtml(params: InvitationEmailParams): string {
  const { inviterName, inviterEmail, tripName, role, invitationId, baseUrl } = params;
  const inviterDisplay = inviterName ? `${inviterName} (${inviterEmail})` : inviterEmail;
  const roleLabel = getRoleLabel(role);
  const acceptUrl = `${baseUrl}/invite/${invitationId}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>여행 초대</title>
</head>
<body style="margin:0;padding:0;background-color:#FDF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FDF8F4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#5C8EA0;padding:32px 32px 24px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">✈️</div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">여행 초대장</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
                <strong style="color:#1F2937;">${escapeHtml(inviterDisplay)}</strong>님이
                회원님을 여행에 초대했습니다.
              </p>
              <!-- Trip info card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F8FAFB;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <span style="font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">여행 이름</span>
                          <div style="font-size:17px;font-weight:700;color:#1F2937;margin-top:4px;">${escapeHtml(tripName)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">역할</span>
                          <div style="font-size:15px;font-weight:600;color:#5C8EA0;margin-top:4px;">${escapeHtml(roleLabel)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(acceptUrl)}" target="_blank" style="display:inline-block;background-color:#5C8EA0;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:-0.2px;">
                      초대 확인하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #E5E7EB;">
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#9CA3AF;text-align:center;">
                      이 초대는 7일 후에 만료됩니다.<br/>
                      본인이 요청하지 않은 초대라면 이 이메일을 무시해 주세요.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<SendResult> {
  const transport = createTransport();
  if (!transport) {
    console.warn('[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping invitation email');
    return { success: false, error: 'Gmail credentials not configured' };
  }

  try {
    const html = buildInvitationHtml(params);

    await transport.sendMail({
      from: `여행 플래너 <${process.env.GMAIL_USER}>`,
      to: params.to,
      subject: `[여행 플래너] ${params.tripName} 여행에 초대되었습니다`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[email] Send error:', message);
    return { success: false, error: message };
  }
}
