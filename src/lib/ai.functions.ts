import { createServerFn } from "@tanstack/react-start";

type Task = "brief" | "summary" | "answer";

const BASE =
  "You are WorkRadar, an assistant for a software team manager named Priya. Use ONLY the provided JSON data. Be concise. Cite item ids. Never invent facts, names, numbers or dates. If the data does not answer the question, say so plainly. Plain text only, no markdown, no emojis.";

const TASKS: Record<Task, string> = {
  brief:
    "Write a 2-3 sentence morning brief: what is at risk, who has been blocked the longest (with hours), and how much was completed since yesterday. Mention item ids in parentheses.",
  summary:
    "Write a 3-4 sentence plain-English summary of this single work item: what it is, current state, what is blocking it (if anything) and what happened most recently.",
  answer:
    "Answer the manager's question in 1-3 sentences using only the numbered sources. Cite sources inline as [1], [2] matching their numbers. If the sources do not contain the answer, say WorkRadar doesn't have that data.",
};

export const generateAi = createServerFn({ method: "POST" })
  .inputValidator((input: { task: Task; data: string; question?: string }) => {
    if (!["brief", "summary", "answer"].includes(input.task)) throw new Error("Invalid task");
    if (typeof input.data !== "string" || input.data.length > 20000) throw new Error("Invalid data");
    if (input.question && input.question.length > 500) throw new Error("Question too long");
    return input;
  })
  .handler(async ({ data }) => {
    const { callGateway } = await import("./ai.server");
    try {
      const prompt = `${data.question ? `Question: ${data.question}\n\n` : ""}Data:\n${data.data}`;
      const text = await callGateway(`${BASE}\n\n${TASKS[data.task]}`, prompt);
      return { ok: true as const, text };
    } catch (e) {
      console.error("AI error", e);
      return { ok: false as const, text: "" };
    }
  });
