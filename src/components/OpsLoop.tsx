import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, MoveRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatePanel from '@/components/StatePanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { OpsContact, OpsStage, TaskPriority } from '@/lib/liveData';

const OPS_STORAGE_KEY = 'command-deck-opsloop-v1';

const priorityColors: Record<TaskPriority, string> = {
  low: 'border-muted-foreground/30 text-muted-foreground',
  medium: 'border-warning/40 text-warning',
  high: 'border-destructive/40 text-destructive',
  urgent: 'border-destructive text-destructive',
};

const stageColors: Record<OpsStage, string> = {
  outreach: 'border-blue-500/30 bg-blue-500/10',
  discovery: 'border-violet-500/30 bg-violet-500/10',
  proposal: 'border-amber-500/30 bg-amber-500/10',
  onboarding: 'border-emerald-500/30 bg-emerald-500/10',
  delivery: 'border-cyan-500/30 bg-cyan-500/10',
  intel: 'border-pink-500/30 bg-pink-500/10',
  retention: 'border-teal-500/30 bg-teal-500/10',
};

interface DraftContact {
  name: string;
  company: string;
  stage: OpsStage;
  priority: TaskPriority;
  nextAction: string;
  notes: string;
  value: string;
}

const defaultDraft: DraftContact = {
  name: '',
  company: '',
  stage: 'outreach',
  priority: 'medium',
  nextAction: '',
  notes: '',
  value: '',
};

const OpsLoop = () => {
  const { data, isLoading, error } = useDashboardData();
  const [contacts, setContacts] = useState<OpsContact[]>([]);
  const [draft, setDraft] = useState<DraftContact>(defaultDraft);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(OPS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OpsContact[];
        if (Array.isArray(parsed)) setContacts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(OPS_STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = () => {
    if (!draft.name.trim()) return;
    const newContact: OpsContact = {
      id: `contact-${Date.now()}`,
      name: draft.name.trim(),
      company: draft.company.trim() || undefined,
      stage: draft.stage,
      priority: draft.priority,
      lastTouch: new Date().toISOString(),
      nextAction: draft.nextAction.trim() || 'Follow up',
      notes: draft.notes.trim() || undefined,
      value: draft.value.trim() || undefined,
    };
    setContacts((prev) => [newContact, ...prev]);
    setDraft(defaultDraft);
    setShowForm(false);
  };

  const advanceStage = (contactId: string) => {
    if (!data) return;
    const stageOrder = data.opsLoop.stageOrder;
    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id !== contactId) return contact;
        const currentIndex = stageOrder.indexOf(contact.stage);
        const nextStage = stageOrder[currentIndex + 1] ?? contact.stage;
        return { ...contact, stage: nextStage, lastTouch: new Date().toISOString() };
      }),
    );
  };

  const removeContact = (contactId: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
  };

  const updateField = (contactId: string, field: keyof OpsContact, value: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, [field]: value, lastTouch: new Date().toISOString() } : contact,
      ),
    );
  };

  if (isLoading) {
    return <StatePanel title="Ops Loop" message="Loading ops pipeline…" detail="7-stage business operations loop: Outreach → Discovery → Proposal → Onboarding → Delivery → Intel → Retention." />;
  }

  if (error || !data) {
    return <StatePanel title="Ops Loop" message="Could not load ops pipeline" detail={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  const { stageOrder, stageLabels, stageEmojis } = data.opsLoop;

  const stats = {
    total: contacts.length,
    byStage: Object.fromEntries(stageOrder.map((stage) => [stage, contacts.filter((c) => c.stage === stage).length])),
  };

  const pipelineValue = contacts.filter((c) => c.value).map((c) => c.value).join(', ');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4 md:p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Business Ops</p>
            <h2 className="text-lg font-semibold text-foreground">7-Stage Ops Loop</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track contacts through: {stageOrder.map((s) => stageLabels[s]).join(' → ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {stats.total === 0 ? (
              <Badge variant="outline" className="text-muted-foreground border-muted">empty pipeline</Badge>
            ) : (
              <Badge variant="outline" className="border-primary/20 text-primary/80">{stats.total} contacts</Badge>
            )}
            {pipelineValue && (
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-400">pipeline: {pipelineValue}</Badge>
            )}
            <Button onClick={() => setShowForm((prev) => !prev)} className="gap-2">
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Add contact'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Chapter 13 outputs, owners, success conditions, proof</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Outputs</p>
              <p>Each stage must produce a visible next action, current owner state, and pipeline movement.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Owners</p>
              <p>Operator sets and reviews the pipeline; agents support follow-up, research, delivery prep, and retention tasks.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Success conditions</p>
              <p>Contacts advance intentionally, values remain visible, and no stage becomes an unowned dead zone.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Proof required</p>
              <p>Stage counts update, contacts advance, next actions persist, and the full 7-stage loop is observable in one view.</p>
            </div>
          </div>
        </div>

        {/* Add contact form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
          >
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={draft.company} onChange={(e) => setDraft((prev) => ({ ...prev, company: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Deal Value</Label>
              <Input value={draft.value} onChange={(e) => setDraft((prev) => ({ ...prev, value: e.target.value }))} placeholder="$5k/mo" />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={draft.stage} onValueChange={(value: OpsStage) => setDraft((prev) => ({ ...prev, stage: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stageOrder.map((stage) => (
                    <SelectItem key={stage} value={stage}>{stageEmojis[stage]} {stageLabels[stage]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={draft.priority} onValueChange={(value: TaskPriority) => setDraft((prev) => ({ ...prev, priority: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Next Action</Label>
              <Input value={draft.nextAction} onChange={(e) => setDraft((prev) => ({ ...prev, nextAction: e.target.value }))} placeholder="Send proposal draft" />
            </div>
            <div className="space-y-2 xl:col-span-4">
              <Label>Notes</Label>
              <Textarea value={draft.notes} onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Context notes…" className="h-16 resize-none" />
            </div>
            <div className="xl:col-span-4 flex justify-end">
              <Button onClick={addContact} disabled={!draft.name.trim()} className="gap-2">
                <Plus size={16} />Add to pipeline
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stage summary pills */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {stageOrder.map((stage) => (
          <div key={stage} className={`glass-card p-2 text-center border ${stageColors[stage]}`}>
            <div className="text-lg">{stageEmojis[stage]}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{stats.byStage[stage]}</div>
            <div className="text-[10px] text-muted-foreground">{stageLabels[stage]}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-foreground font-semibold mb-1">Pipeline is empty</h3>
          <p className="text-sm text-muted-foreground">Add contacts above to track them through your 7-stage ops loop.</p>
        </div>
      )}

      {/* Kanban lanes */}
      {contacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stageOrder.map((stage, si) => {
            const stageContacts = contacts.filter((c) => c.stage === stage);
            const isLastStage = si === stageOrder.length - 1;
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.07 }}
                className={`glass-card p-3 border ${stageColors[stage]}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{stageEmojis[stage]}</span>
                    <h3 className="text-sm font-semibold text-foreground">{stageLabels[stage]}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs text-muted-foreground border-muted">{stageContacts.length}</Badge>
                </div>
                <ScrollArea className="h-[340px]">
                  <div className="space-y-2 pr-1">
                    {stageContacts.map((contact, ci) => (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: si * 0.07 + ci * 0.04 }}
                        className="rounded-lg bg-background/40 border border-border/30 p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <p className="text-sm font-medium text-foreground">{contact.name}</p>
                            {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            {contact.value && (
                              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{contact.value}</Badge>
                            )}
                            <Badge variant="outline" className={`text-[10px] capitalize ${priorityColors[contact.priority]}`}>{contact.priority}</Badge>
                          </div>
                        </div>

                        {contact.nextAction && (
                          <p className="text-xs text-muted-foreground bg-secondary/30 rounded px-2 py-1">
                            → {contact.nextAction}
                          </p>
                        )}

                        {contact.notes && (
                          <p className="text-xs text-muted-foreground/70 italic">{contact.notes}</p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Input
                            value={contact.nextAction}
                            onChange={(e) => updateField(contact.id, 'nextAction', e.target.value)}
                            placeholder="Next action…"
                            className="h-6 text-xs px-2"
                          />
                          <div className="flex gap-1 flex-shrink-0">
                            {!isLastStage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => advanceStage(contact.id)}
                                title={`Advance to ${stageLabels[stageOrder[si + 1]]}`}
                              >
                                <MoveRight size={12} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive"
                              onClick={() => removeContact(contact.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {stageContacts.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground/50">empty</div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpsLoop;
