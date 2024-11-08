import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';

const MessageTable = () => {
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });

    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages');
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    socket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('messageUpdate', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleReplyChange = (id, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [id]: value,
    }));
  };

  const handleReply = async (id) => {
    const response = responses[id];
    if (!response) return;

    try {
      await axios.post(`http://localhost:5000/api/messages/${id}/respond`, { response });
      setResponses((prevResponses) => ({ ...prevResponses, [id]: '' }));
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" component="h1" gutterBottom>Agent Portal</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer ID</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Urgency</TableCell>
            <TableCell>Response</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{message.customer_id}</TableCell>
              <TableCell>{message.message}</TableCell>
              <TableCell>{message.urgency_level}</TableCell>
              <TableCell>
                {message.response ? (
                  <Typography>{message.response}</Typography>
                ) : (
                  <TextField
                    value={responses[message.id] || ''}
                    onChange={(e) => handleReplyChange(message.id, e.target.value)}
                    placeholder="Type your response"
                    fullWidth
                  />
                )}
              </TableCell>
              <TableCell>
                {!message.response && (
                  <Button variant="contained" color="primary" onClick={() => handleReply(message.id)}>Reply</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MessageTable;
