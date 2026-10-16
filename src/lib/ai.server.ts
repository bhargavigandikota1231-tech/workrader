const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

export async function callGateway(instructions: string, input: string): Promise<string> {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) throw new Error("AI is not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}) ${t.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        if (ev.type === "error" || ev.type === "response.failed") throw new Error("AI stream failed");
      } catch (e) {
        if (e instanceof Error && e.message === "AI stream failed") throw e;
      }
    }
  }
  if (!out.trim()) throw new Error("Empty AI response");
  return out.trim();
}
