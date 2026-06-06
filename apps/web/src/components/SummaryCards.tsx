import { AlertCircle, CheckSquare, Clock3, Mail } from "lucide-react";
import type { ActionCenterPayload } from "../types";

interface SummaryCardsProps {
  summary: ActionCenterPayload["summary"];
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    { label: "Total Tasks", value: summary.totalTasks, note: `${summary.completedTasks} completed`, icon: CheckSquare },
    { label: "In Progress", value: summary.inProgressTasks, note: `${Math.round((summary.inProgressTasks / summary.totalTasks) * 100)}% of tasks`, icon: Clock3 },
    { label: "Urgent", value: summary.urgentTasks, note: "Requires attention", icon: AlertCircle },
    { label: "Unread Messages", value: summary.unreadMessages, note: "Awaiting response", icon: Mail },
  ];

  return (
    <section className="summary-grid" aria-label="Student action center summary">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="summary-card" key={card.label}>
            <div className="summary-icon">
              <Icon size={22} />
            </div>
            <div>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
              <p>{card.note}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

