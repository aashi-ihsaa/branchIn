const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});

// Initial endpoint to fetch all messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to insert a new message and emit to clients
app.post('/api/messages', async (req, res) => {
  const { customer_id, message, urgency_level } = req.body;
  if (!customer_id || !message || !urgency_level) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (customer_id, message, urgency_level, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, message, urgency_level, 'new']
    );

    const newMessage = result.rows[0];
    io.emit('newMessage', newMessage);  // Emit the new message to all clients
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to respond to a message and emit the updated message
// Endpoint to respond to a message and emit the updated message
app.post('/api/messages/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  try {
    const result = await pool.query(
      'UPDATE messages SET response = $1, status = $2 WHERE id = $3 RETURNING *',
      [response, 'responded', id]
    );

    const updatedMessage = result.rows[0];
    if (updatedMessage) {
      io.emit('messageUpdate', updatedMessage);  // Emit updated message object
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error responding to message:', error);
    res.sendStatus(500);
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
