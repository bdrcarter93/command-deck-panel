import { ReactNode } from 'react';

interface StatePanelProps {
  title: string;
  message: string;
  detail?: string;
  children?: ReactNode;
}

const StatePanel = ({ title, message, detail, children }: StatePanelProps) => (
  <div className="glass-card p-5 space-y-2">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
    <p className="text-sm text-foreground">{message}</p>
    {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
    {children}
  </div>
);

export default StatePanel;
