const pool = require("../db.js");

async function getDepartments(req, res) {
    try {
        const [rows] = await pool.query(`
            SELECT
                department_id,
                department_name,
                secure_area_flag,
                status,
                created_at,
                updated_at
            FROM departments
            WHERE status = 'ACTIVE'
            ORDER BY department_name ASC
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    getDepartments
};