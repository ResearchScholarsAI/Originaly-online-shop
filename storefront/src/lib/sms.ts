/**
 * SMS provider abstraction.
 * Never lock OTP to a single vendor — swap via SMS_PROVIDER env:
 *   log (default) | kavenegar | bird
 */
export type SmsProviderId = "log" | "kavenegar" | "bird";

export type SmsSendResult = {
  provider: SmsProviderId;
  status: "logged" | "sent" | "failed";
  messageId?: string;
};

export interface SmsProvider {
  readonly id: SmsProviderId;
  sendOtp(phone: string, code: string): Promise<SmsSendResult>;
}

class LogProvider implements SmsProvider {
  readonly id = "log" as const;
  async sendOtp(_phone: string, _code: string): Promise<SmsSendResult> {
    return { provider: "log", status: "logged" };
  }
}

class KavenegarProvider implements SmsProvider {
  readonly id = "kavenegar" as const;
  async sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return { provider: "kavenegar", status: "failed" };
    const receptor = phone.replace(/^0/, "98");
    const url = `https://api.kavenegar.com/v1/${key}/verify/lookup.json?receptor=${encodeURIComponent(receptor)}&token=${encodeURIComponent(code)}&template=originaly-otp`;
    const res = await fetch(url);
    if (!res.ok) return { provider: "kavenegar", status: "failed" };
    return { provider: "kavenegar", status: "sent", messageId: String(Date.now()) };
  }
}

class BirdProvider implements SmsProvider {
  readonly id = "bird" as const;
  async sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    const key = process.env.BIRD_API_KEY;
    const origin = process.env.BIRD_ORIGINATOR ?? "Originaly";
    if (!key) return { provider: "bird", status: "failed" };
    const to = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;
    const res = await fetch("https://api.bird.com/workspaces/default/channels/sms/messages", {
      method: "POST",
      headers: {
        Authorization: `AccessKey ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originator: origin,
        body: { text: `کد ورود اورجینالی: ${code}` },
        receiver: { contacts: [{ identifierValue: to }] },
      }),
    });
    if (!res.ok) return { provider: "bird", status: "failed" };
    return { provider: "bird", status: "sent" };
  }
}

export function resolveSmsProvider(): SmsProvider {
  const name = (process.env.SMS_PROVIDER ?? "log").toLowerCase();
  if (name === "kavenegar" && process.env.KAVENEGAR_API_KEY) return new KavenegarProvider();
  if (name === "bird" && process.env.BIRD_API_KEY) return new BirdProvider();
  return new LogProvider();
}

export function smsProviderLabel(id: SmsProviderId) {
  if (id === "kavenegar") return "کاوه‌نگار";
  if (id === "bird") return "Bird";
  return "حالت آزمایشی";
}
