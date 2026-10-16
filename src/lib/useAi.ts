import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateAi } from "./ai.functions";

export function useAi(task: "brief" | "summary" | "answer", data: string, opts: { question?: string; enabled?: boolean; nonce?: number } = {}) {
  const fn = useServerFn(generateAi);
  return useQuery({
    queryKey: ["ai", task, data, opts.question ?? "", opts.nonce ?? 0],
    queryFn: () => fn({ data: { task, data, question: opts.question } }),
    enabled: opts.enabled ?? true,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
