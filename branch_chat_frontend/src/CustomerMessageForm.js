import React, { useState } from 'react';
import { TextField, Button, MenuItem, Typography, Container } from '@mui/material';
import axios from 'axios';

const CustomerMessageForm = () => {
  const [customerId, setCustomerId] = useState('');
  const [message, setMessage] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [response, setResponse] = useState(null);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !message) {
      setResponse({ error: 'Customer ID and message are required' });
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        customer_id: customerId,
        message,
        urgency_level: urgencyLevel,
      });
      setMessage('');
      setUrgencyLevel('normal');
      setCustomerId('');
      setResponse(res.data);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse({ error: 'Failed to send message' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>Customer Portal</Typography>
      <form onSubmit={handleMessageSubmit}>
        <TextField
          fullWidth
          label="Customer ID"
          type="number"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          select
          label="Urgency Level"
          value={urgencyLevel}
          onChange={(e) => setUrgencyLevel(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" type="submit" fullWidth>Send Message</Button>
      </form>
      {response && <Typography color="error">{response.error || 'Message sent! We will get back to you soon.'}</Typography>}
    </Container>
  );
};

export default CustomerMessageForm;
