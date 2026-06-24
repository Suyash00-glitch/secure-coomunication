// Page display names — keys match page state identifiers used throughout the app
export const pageNames = {
  "dashboard": "Dashboard",
  "ticket-list": "Ticket List",
  "create-ticket": "Create Ticket",
  "ticket-detail": "Ticket Detail",
  "notif-list": "Notification List",
  "create-notif": "Create Notification",
  "notif-detail": "Notification Detail",
  "user-master": "User Master",
  "dept-master": "Department Master"
};

// Breadcrumb section mapping
export const pageSections = {
  "dashboard": "Home",
  "ticket-list": "Tickets",
  "create-ticket": "Tickets",
  "ticket-detail": "Tickets",
  "notif-list": "Notifications",
  "create-notif": "Notifications",
  "notif-detail": "Notifications",
  "user-master": "Administration",
  "dept-master": "Administration"
};

// Predefined "Expected Response / Action Required" options
export const RESPONSE_OPTIONS = [
  "Email confirmation sent",
  "Refund processed",
  "Issue escalated to L2",
  "Follow-up call scheduled"
];

// Department checkboxes on the Create Notification page (ids match original markup)
export const NOTIF_DEPARTMENTS = [
  { id: "checkbox-31", label: "Finance", defaultChecked: true },
  { id: "checkbox-32", label: "IT Support", defaultChecked: false },
  { id: "checkbox-33", label: "Human Resources", defaultChecked: true },
  { id: "checkbox-34", label: "Legal", defaultChecked: false },
  { id: "checkbox-35", label: "Operations", defaultChecked: true },
  { id: "checkbox-36", label: "Administration", defaultChecked: false },
  { id: "checkbox-37", label: "Procurement", defaultChecked: false }
];
