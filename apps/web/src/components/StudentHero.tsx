import { AlertCircle, GraduationCap, Mail, ShieldAlert, UserRound } from "lucide-react";
import type { ActionCenterPayload } from "../types";

interface StudentHeroProps {
  actionCenter: ActionCenterPayload;
}

export function StudentHero({ actionCenter }: StudentHeroProps) {
  const { student, summary } = actionCenter;
  const statusLabel = student.enrollmentStatus === "at_risk" ? "At Risk" : "Active";

  return (
    <section className="student-hero">
      <img className="student-photo" src={`/avatars/${student.id}.svg`} alt={student.name} />
      <div className="student-main">
        <div className="name-row">
          <h2>{student.name}</h2>
          <span className={`badge enrollment-${student.enrollmentStatus}`}>{statusLabel}</span>
        </div>
        <div className="student-grid">
          <span>
            <GraduationCap size={16} /> Grade <strong>{student.grade}</strong>
          </span>
          <span>
            <UserRound size={16} /> GPA <strong>{student.gpa}</strong>
          </span>
          <span>
            <ShieldAlert size={16} /> Student ID <strong>{student.id}</strong>
          </span>
          <span>
            <Mail size={16} /> Email <strong>{student.email}</strong>
          </span>
        </div>
      </div>
      <div className={`urgency-panel urgency-${summary.urgencyLevel}`}>
        <span>Urgency</span>
        <strong>
          {summary.urgencyLevel}
          <AlertCircle size={16} />
        </strong>
        <p>{summary.urgencyReasons.join(", ")}</p>
        <svg viewBox="0 0 140 42" aria-hidden="true">
          <polyline points="0,34 18,20 32,31 47,12 64,26 82,8 98,23 113,5 140,28" />
        </svg>
      </div>
    </section>
  );
}

