import net from "node:net";
import tls from "node:tls";

type ContactEmailInput = {
  name: string;
  email: string;
  type?: string | null;
  detail: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
};

class SmtpClient {
  private socket: net.Socket | tls.TLSSocket;
  private buffer = "";
  private pendingRead: {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
  } | null = null;

  constructor(socket: net.Socket | tls.TLSSocket) {
    this.socket = socket;
    this.attachListeners();
  }

  async readResponse() {
    const parsed = this.tryParseResponse();
    if (parsed) return parsed;

    return await new Promise<string>((resolve, reject) => {
      this.pendingRead = { resolve, reject };
    });
  }

  async sendCommand(command: string, expectedCodes: number[]) {
    this.socket.write(`${command}\r\n`);
    const response = await this.readResponse();
    const code = Number(response.slice(0, 3));

    if (!expectedCodes.includes(code)) {
      throw new Error(`SMTP command failed (${command}): ${response.trim()}`);
    }

    return response;
  }

  writeRaw(data: string) {
    this.socket.write(data);
  }

  detachSocket() {
    this.socket.removeAllListeners("data");
    this.socket.removeAllListeners("error");
    return this.socket;
  }

  setSocket(socket: net.Socket | tls.TLSSocket) {
    this.socket = socket;
    this.buffer = "";
    this.pendingRead = null;
    this.attachListeners();
  }

  end() {
    this.socket.end();
  }

  private attachListeners() {
    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk: string) => {
      this.buffer += chunk;
      this.flushRead();
    });
    this.socket.on("error", (error) => {
      if (this.pendingRead) {
        this.pendingRead.reject(error instanceof Error ? error : new Error(String(error)));
        this.pendingRead = null;
      }
    });
  }

  private flushRead() {
    if (!this.pendingRead) return;
    const parsed = this.tryParseResponse();
    if (!parsed) return;

    this.pendingRead.resolve(parsed);
    this.pendingRead = null;
  }

  private tryParseResponse() {
    const lines = this.buffer.split("\r\n");
    if (lines.length < 2) return null;

    const completeLines = lines.slice(0, -1);
    if (completeLines.length === 0) return null;

    const firstLine = completeLines[0];
    const firstMatch = firstLine.match(/^(\d{3})([ -])/);
    if (!firstMatch) return null;

    const code = firstMatch[1];

    for (let index = 0; index < completeLines.length; index += 1) {
      const line = completeLines[index];
      const match = line.match(/^(\d{3})([ -])/);
      if (!match || match[1] !== code) return null;

      if (match[2] === " ") {
        const response = completeLines.slice(0, index + 1).join("\r\n");
        this.buffer = lines.slice(index + 1).join("\r\n");
        return response;
      }
    }

    return null;
  }
}

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = (process.env.SMTP_SECURE ?? "").trim().toLowerCase() === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || user;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "aisurix.web";
  const toEmails = (process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!host || !port || !user || !pass || !fromEmail || toEmails.length === 0) {
    throw new Error("SMTP configuration is incomplete.");
  }

  return { host, port, secure, user, pass, fromEmail, fromName, toEmails };
}

function encodeBase64Lines(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .match(/.{1,76}/g)
    ?.join("\r\n") ?? "";
}

function encodeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function escapeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function buildMessage(config: SmtpConfig, input: ContactEmailInput) {
  const submittedAt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  const projectType = input.type?.trim() || "Belirtilmedi";
  const subject = `${input.name} - Yeni iletisim formu`;
  const plainText = [
    "Yeni iletisim formu gonderildi.",
    "",
    `Ad Soyad: ${input.name}`,
    `E-posta: ${input.email}`,
    `Proje Turu: ${projectType}`,
    `Gonderim Zamani: ${submittedAt}`,
    "",
    "Mesaj:",
    input.detail,
  ].join("\n");

  return [
    `From: ${escapeHeader(config.fromName)} <${config.fromEmail}>`,
    `To: ${config.toEmails.join(", ")}`,
    `Reply-To: ${escapeHeader(input.name)} <${escapeHeader(input.email)}>`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(plainText),
    "",
  ].join("\r\n");
}

async function createClient(config: SmtpConfig) {
  const socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    const onError = (error: Error) => reject(error);

    if (config.secure) {
      const secureSocket = tls.connect(
        {
          host: config.host,
          port: config.port,
          servername: config.host,
        },
        () => resolve(secureSocket),
      );
      secureSocket.once("error", onError);
      return;
    }

    const plainSocket = net.connect(
      {
        host: config.host,
        port: config.port,
      },
      () => resolve(plainSocket),
    );
    plainSocket.once("error", onError);
  });

  const client = new SmtpClient(socket);
  const greeting = await client.readResponse();
  if (!greeting.startsWith("220")) {
    throw new Error(`SMTP greeting failed: ${greeting.trim()}`);
  }

  await client.sendCommand(`EHLO ${config.host}`, [250]);

  if (!config.secure) {
    await client.sendCommand("STARTTLS", [220]);

    const upgradedSocket = tls.connect({
      socket: client.detachSocket(),
      servername: config.host,
    });

    await new Promise<void>((resolve, reject) => {
      upgradedSocket.once("secureConnect", () => resolve());
      upgradedSocket.once("error", reject);
    });

    client.setSocket(upgradedSocket);
    await client.sendCommand(`EHLO ${config.host}`, [250]);
  }

  return client;
}

export async function sendContactEmail(input: ContactEmailInput) {
  const config = getSmtpConfig();
  const client = await createClient(config);

  try {
    await client.sendCommand("AUTH LOGIN", [334]);
    await client.sendCommand(Buffer.from(config.user, "utf8").toString("base64"), [334]);
    await client.sendCommand(Buffer.from(config.pass, "utf8").toString("base64"), [235]);
    await client.sendCommand(`MAIL FROM:<${config.fromEmail}>`, [250]);

    for (const recipient of config.toEmails) {
      await client.sendCommand(`RCPT TO:<${recipient}>`, [250, 251]);
    }

    await client.sendCommand("DATA", [354]);
    client.writeRaw(`${buildMessage(config, input)}\r\n.\r\n`);

    const dataResponse = await client.readResponse();
    if (!dataResponse.startsWith("250")) {
      throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
    }

    await client.sendCommand("QUIT", [221]);
  } finally {
    client.end();
  }
}
