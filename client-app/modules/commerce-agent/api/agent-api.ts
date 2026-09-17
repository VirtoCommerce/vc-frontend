import { AGENT_BASE_URL, SESSION_HEADER } from "../constants";
import type { IAgentEvent, IAgentSession } from "../types";

/**
 * Identity is presented on every call and stored nowhere. Session start exchanges the access
 * token the storefront already holds for a session id; each later call carries that id and a
 * bearer, which the service checks still resolves to the same principal. A session id on its
 * own therefore authorizes nothing, and a refreshed token needs no handshake — the next call
 * simply carries the newer one. No request body names a customer.
 */
export async function startAgentSession(authorization: string): Promise<IAgentSession> {
  const response = await fetch(`${AGENT_BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authorization },
    body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  });

  const body = (await response.json()) as {
    session_id?: string;
    name?: string;
    organization?: string;
    detail?: string;
  };

  if (!response.ok || !body.session_id) {
    throw new Error(body.detail ?? `The assistant refused the session (${response.status})`);
  }

  return { sessionId: body.session_id, name: body.name, organization: body.organization };
}

/**
 * One turn, streamed. `onEvent` is called for each event as it arrives; the promise settles
 * when the stream ends. `signal` aborts an answer the customer navigated away from.
 */
export async function streamAgentTurn(
  sessionId: string,
  authorization: string,
  message: string,
  onEvent: (event: IAgentEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${AGENT_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [SESSION_HEADER]: sessionId,
      Authorization: authorization,
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`The assistant is unavailable (${response.status})`);
  }

  await readServerSentEvents(response.body, onEvent);
}

async function readServerSentEvents(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: IAgentEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const event = parseFrame(frame);

      if (event) {
        onEvent(event);
      }

      boundary = buffer.indexOf("\n\n");
    }
  }
}

function parseFrame(frame: string): IAgentEvent | undefined {
  let type: string | undefined;
  let data: string | undefined;

  for (const line of frame.split("\n")) {
    if (line.startsWith("event: ")) {
      type = line.slice(7);
    } else if (line.startsWith("data: ")) {
      data = line.slice(6);
    }
  }

  if (!type || !data) {
    return undefined;
  }

  return { type: type as IAgentEvent["type"], data: JSON.parse(data) as Record<string, unknown> };
}
