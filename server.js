const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,  // Make sure this is passed as a string
  port: DB_PORT,
});


app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages WHERE status = $1', ['pending']);
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

app.post('/api/messages/:id/respond', async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        // Update message status to 'resolved' or similar after response
        await pool.query('UPDATE messages SET status = $1 WHERE id = $2', ['resolved', id]);

        res.json({ msg: "Response recorded!" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
