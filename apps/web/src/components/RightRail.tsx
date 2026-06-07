import { CheckCircle2, CircleAlert, Clock3, Mail } from "lucide-react";
import { formatMessageTime } from "../lib/format";
import type { ActionCenterPayload } from "../types";

interface RightRailProps {
  actionCenter: ActionCenterPayload;
  onViewMessages: () => void;
  onViewTasks: () => void;
}

export function RightRail({ actionCenter, onViewMessages, onViewTasks }: RightRailProps) {
  const recentActivities = [
    { icon: CheckCircle2, title: "Task completed", text: `${actionCenter.summary.completedTasks} completed items on record` },
    { icon: CircleAlert, title: "Urgency updated", text: actionCenter.summary.urgencyReasons[0] },
    { icon: Clock3, title: "Next deadline", text: actionCenter.summary.nextDueDate ?? "No open deadline" },
  ];

  return (
    <aside className="right-rail">
      <section className="side-panel">
        <div className="panel-header">
          <h2>Recent Messages</h2>
          <button type="button" onClick={onViewMessages}>View all</button>
        </div>
        <div className="message-list">
          {actionCenter.messages.slice(0, 3).map((message) => (
            <article className={!message.read ? "message unread" : "message"} key={message.id}>
              <div className="message-icon">
                <Mail size={17} />
              </div>
              <div>
                <div className="message-top">
                  <strong>{message.from}</strong>
                  <span>{formatMessageTime(message.receivedAt)}</span>
                </div>
                <p>{message.subject}</p>
                <span>{message.preview}</span>
              </div>
            </article>
          ))}
        </div>
        <strong className="unread-note">{actionCenter.summary.unreadMessages} unread messages</strong>
      </section>

      <section className="side-panel">
        <div className="panel-header">
          <h2>Recent Activity</h2>
          <button type="button" onClick={onViewTasks}>View all</button>
        </div>
        <div className="activity-list">
          {recentActivities.map((item) => {
            const Icon = item.icon;
            return (
              <article className="activity" key={item.title}>
                <Icon size={18} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
