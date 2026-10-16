import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { WORK_ITEMS, type WorkItem } from "@/data/mockData";

export type DemoState = "normal" | "empty" | "error";
const KEY = "workradar-state-v1";
const DEMO_KEY = "workradar-demo-v1";

interface Ctx {
  items: WorkItem[];
  demo: DemoState;
  setDemo: (d: DemoState) => void;
  assign: (id: string, owner: string) => void;
  markDone: (id: string) => void;
  snooze: (id: string, label: string) => void;
  unsnooze: (id: string) => void;
  reset: () => void;
  getItem: (id: string) => WorkItem | undefined;
}

const WorkCtx = createContext<Ctx | null>(null);

export function WorkProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WorkItem[]>(WORK_ITEMS);
  const [demo, setDemoState] = useState<DemoState>("normal");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const d = localStorage.getItem(DEMO_KEY) as DemoState | null;
      if (d) setDemoState(d);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const setDemo = useCallback((d: DemoState) => {
    setDemoState(d);
    localStorage.setItem(DEMO_KEY, d);
  }, []);

  const update = useCallback((id: string, patch: Partial<WorkItem>) => {
    let prev: WorkItem | undefined;
    setItems((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        prev = i;
        return { ...i, ...patch };
      }),
    );
    return () => {
      if (prev) {
        const snapshot = prev;
        setItems((list) => list.map((i) => (i.id === id ? snapshot : i)));
      }
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      demo,
      setDemo,
      getItem: (id) => items.find((i) => i.id === id),
      assign: (id, owner) => {
        update(id, { owner });
        toast.success(`Assigned to ${owner}`);
      },
      markDone: (id) => {
        const undo = update(id, { status: "Done", snoozed: null });
        toast.success(`${id} marked as done`, { action: { label: "Undo", onClick: () => undo() } });
      },
      snooze: (id, label) => {
        const undo = update(id, { snoozed: label });
        toast(`${id} snoozed ${label.toLowerCase()}`, { action: { label: "Undo", onClick: () => undo() } });
      },
      unsnooze: (id) => {
        update(id, { snoozed: null });
        toast(`${id} is back in your feed`);
      },
      reset: () => {
        setItems(WORK_ITEMS);
        setDemo("normal");
        toast("Demo data reset");
      },
    }),
    [items, demo, setDemo, update],
  );

  return <WorkCtx.Provider value={value}>{children}</WorkCtx.Provider>;
}

export function useWork() {
  const ctx = useContext(WorkCtx);
  if (!ctx) throw new Error("useWork must be used inside WorkProvider");
  return ctx;
}
