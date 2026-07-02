import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);

  useEffect(() => { loadActivity(); }, []);

  async function loadActivity() {
    try {
      const { res, data } = await apiJson("/api/internal/activity");
      if (res.ok) setActivities(data);
    } catch (err) { console.log(err); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Activity History</div>
          <div className="page-sub">Department audit trail</div>
        </div>
      </div>
      <div className="card">
        {activities.length === 0 ? (
          <p>No activity found.</p>
        ) : (
          activities.map((a, index) => (
            <div className="activity-item" key={index}>
              <div>
                <div className="act-text">
                  <strong>{a.type === "notification" ? `NTF-${String(a.item_id).padStart(4, "0")}` : `TKT-${String(a.item_id).padStart(4, "0")}`}</strong>
                  {" — "}{a.action}{" by "}<strong>{a.performed_by}</strong>
                </div>
                <div className="act-time">{new Date(a.performed_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
