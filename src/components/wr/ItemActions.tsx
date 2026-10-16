import { useState } from "react";
import { BellOff, Check, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TEAM, type WorkItem } from "@/data/mockData";
import { useWork } from "@/lib/store";

export const SNOOZE_OPTIONS = ["1 hour", "Until tomorrow", "Next week"];

export function AssignDialog({ item, open, onOpenChange }: { item: WorkItem; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { assign } = useWork();
  const [owner, setOwner] = useState(item.owner);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) setOwner(item.owner); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {item.id}</DialogTitle>
          <DialogDescription>{item.title}</DialogDescription>
        </DialogHeader>
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TEAM.map((m) => (
              <SelectItem key={m.name} value={m.name}>{m.name} · {m.role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { assign(item.id, owner); onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Full button row used on Item Detail. */
export function ItemActionButtons({ item }: { item: WorkItem }) {
  const { markDone, snooze, unsnooze } = useWork();
  const [assignOpen, setAssignOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setAssignOpen(true)}><UserPlus /> Assign</Button>
      <Button variant="outline" disabled={item.status === "Done"} onClick={() => markDone(item.id)}><Check /> Mark Done</Button>
      {item.snoozed ? (
        <Button variant="outline" onClick={() => unsnooze(item.id)}><BellOff /> Unsnooze</Button>
      ) : (
        <Popover open={snoozeOpen} onOpenChange={setSnoozeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={item.status === "Done"}><BellOff /> Snooze</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1">
            {SNOOZE_OPTIONS.map((o) => (
              <Button key={o} variant="ghost" className="w-full justify-start" onClick={() => { snooze(item.id, o); setSnoozeOpen(false); }}>{o}</Button>
            ))}
          </PopoverContent>
        </Popover>
      )}
      <Button disabled title="Disabled in demo mode">Open in {item.source}</Button>
      <AssignDialog item={item} open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  );
}

/** Compact "…" menu used in lists. */
export function ItemActionMenu({ item }: { item: WorkItem }) {
  const { markDone, snooze, unsnooze } = useWork();
  const [assignOpen, setAssignOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${item.id}`} onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => setAssignOpen(true)}><UserPlus /> Assign</DropdownMenuItem>
          {item.status !== "Done" && <DropdownMenuItem onSelect={() => markDone(item.id)}><Check /> Mark Done</DropdownMenuItem>}
          {item.snoozed ? (
            <DropdownMenuItem onSelect={() => unsnooze(item.id)}><BellOff /> Unsnooze</DropdownMenuItem>
          ) : item.status !== "Done" ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><BellOff className="mr-2 h-4 w-4" /> Snooze</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {SNOOZE_OPTIONS.map((o) => (
                  <DropdownMenuItem key={o} onSelect={() => snooze(item.id, o)}>{o}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AssignDialog item={item} open={assignOpen} onOpenChange={setAssignOpen} />
    </>
  );
}
