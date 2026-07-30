const pool = require("../db.js");

async function createDepartment(req, res) {
  try {
    const { department_name, secure_area_flag, status } = req.body;
    await pool.query(
      `INSERT INTO departments (department_name, secure_area_flag, status) VALUES (?,?,?)`,
      [department_name, secure_area_flag, status]
    );
    res.json({ message: "department created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getDepartments(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM departments ORDER BY department_name`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getActiveDepartments(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT department_id, department_name
      FROM departments
      WHERE LOWER(status) = 'active'
      ORDER BY department_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateDepartment(req, res) {
  try {
    const { department_name } = req.body;
    await pool.query(
      `UPDATE departments SET department_name = ? WHERE department_id = ?`,
      [department_name, req.params.id]
    );
    res.json({ message: "Department updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deactivateDepartment(req, res) {
  try {
    const deptId = req.params.id;

    const [activeUsers] = await pool.query(
      `SELECT user_id FROM users WHERE department_id = ? AND is_active = true`,
      [deptId]
    );
    if (activeUsers.length > 0) {
      return res.status(400).json({
        message: `Cannot deactivate — ${activeUsers.length} active user(s) still in this department`
      });
    }

    const [openTickets] = await pool.query(
      `SELECT t.ticket_id FROM tickets t
       JOIN status_master sm ON t.status_id = sm.status_id
       WHERE t.assigned_department = ? AND LOWER(sm.status_name) != 'closed'`,
      [deptId]
    );
    if (openTickets.length > 0) {
      return res.status(400).json({
        message: `Cannot deactivate — ${openTickets.length} open ticket(s) assigned to this department`
      });
    }

    const [unackNotifs] = await pool.query(
      `SELECT notification_master_id FROM notification_master
       WHERE department_id = ? AND is_acknowledged = false`,
      [deptId]
    );
    if (unackNotifs.length > 0) {
      return res.status(400).json({
        message: `Cannot deactivate — ${unackNotifs.length} unacknowledged notification(s) pending for this department`
      });
    }

    await pool.query(
      `UPDATE departments SET status = 'Inactive' WHERE department_id = ?`,
      [deptId]
    );

    res.json({ message: "Department deactivated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function activateDepartment(req, res) {
  try {
    await pool.query(
      `UPDATE departments SET status = 'Active' WHERE department_id = ?`,
      [req.params.id]
    );
    res.json({ message: "Department activated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createDepartment, getDepartments, getActiveDepartments,
  updateDepartment, deactivateDepartment, activateDepartment
};