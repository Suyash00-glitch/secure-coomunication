export default function ActivityHistory() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Activity History</div>

          <div className="page-sub">
            Full audit trail of all actions performed
          </div>
        </div>
      </div>

      <div className="card">
        <div className="activity-item">
          <div>
            <div className="act-text">
              <strong>NTF-0031</strong> — Notification received from Arjun Patel
            </div>

            <div className="act-time">15 Jun 2026 · 09:12 AM</div>
          </div>
        </div>

        <div className="activity-item">
          <div>
            <div className="act-text">
              <strong>TKT-0092</strong> — Ticket opened by Meena Krishnan
            </div>

            <div className="act-time">15 Jun 2026 · 08:47 AM</div>
          </div>
        </div>

        <div className="activity-item">
          <div>
            <div className="act-text">
              <strong>NTF-0030</strong> — Acknowledged by Priya Sharma
            </div>

            <div className="act-time">14 Jun 2026 · 04:30 PM</div>
          </div>
        </div>

        <div className="activity-item">
          <div>
            <div className="act-text">
              <strong>TKT-0091</strong> — Reassigned
            </div>

            <div className="act-time">14 Jun 2026 · 02:15 PM</div>
          </div>
        </div>

        <div className="activity-item">
          <div>
            <div className="act-text">
              <strong>TKT-0089</strong> — Closed successfully
            </div>

            <div className="act-time">13 Jun 2026 · 10:22 AM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
