/**
 * ConnectWise Manage tickets for the na.myconnectwise.net site.
 * The API host is fixed. Stays off until every value below is set.
 *
 * CONNECTWISE_COMPANY_ID           company id from the Manage login box
 * CONNECTWISE_PUBLIC_KEY           API member public key
 * CONNECTWISE_PRIVATE_KEY          API member private key
 * CONNECTWISE_CLIENT_ID            client id from developer.connectwise.com
 * CONNECTWISE_TICKET_COMPANY_ID    company record the website tickets are filed under
 * CONNECTWISE_SALES_BOARD_ID       board for an IT assessment
 * CONNECTWISE_SUPPORT_BOARD_ID     board for a help desk request
 */

export type TicketInput = {
  intent: "Assessment" | "Support";
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
};

type Config = {
  url: string;
  companyId: string;
  publicKey: string;
  privateKey: string;
  clientId: string;
  ticketCompanyId: number;
  salesBoardId: number;
  supportBoardId: number;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function numberVar(name: string) {
  const raw = required(name);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** API for the North America cloud login at na.myconnectwise.net. */
const MANAGE_URL = "https://api-na.myconnectwise.net";

export function connectwiseConfig(): Config | null {
  const companyId = required("CONNECTWISE_COMPANY_ID");
  const publicKey = required("CONNECTWISE_PUBLIC_KEY");
  const privateKey = required("CONNECTWISE_PRIVATE_KEY");
  const clientId = required("CONNECTWISE_CLIENT_ID");
  const ticketCompanyId = numberVar("CONNECTWISE_TICKET_COMPANY_ID");
  const salesBoardId = numberVar("CONNECTWISE_SALES_BOARD_ID");
  const supportBoardId = numberVar("CONNECTWISE_SUPPORT_BOARD_ID");
  if (
    !companyId ||
    !publicKey ||
    !privateKey ||
    !clientId ||
    !ticketCompanyId ||
    !salesBoardId ||
    !supportBoardId
  ) {
    return null;
  }
  return {
    url: MANAGE_URL,
    companyId,
    publicKey,
    privateKey,
    clientId,
    ticketCompanyId,
    salesBoardId,
    supportBoardId,
  };
}

export function connectwiseTicketBody(config: Config, input: TicketInput) {
  const summary = `${input.intent} — ${input.name}`.slice(0, 100);
  const detail = [
    input.company ? `Company: ${input.company}` : null,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    summary,
    board: { id: input.intent === "Support" ? config.supportBoardId : config.salesBoardId },
    company: { id: config.ticketCompanyId },
    contactName: input.name.slice(0, 62),
    contactEmailAddress: input.email,
    ...(input.phone ? { contactPhoneNumber: input.phone.slice(0, 30) } : {}),
    initialDescription: detail,
  };
}

/** Opens one service ticket. Returns false when Manage rejects it. */
export async function createConnectWiseTicket(input: TicketInput) {
  const config = connectwiseConfig();
  if (!config) return false;

  const token = Buffer.from(
    `${config.companyId}+${config.publicKey}:${config.privateKey}`,
  ).toString("base64");

  const response = await fetch(`${config.url}/v4_6_release/apis/3.0/service/tickets`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      clientId: config.clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(connectwiseTicketBody(config, input)),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[connectwise]", response.status, detail.slice(0, 500));
    return false;
  }
  return true;
}
