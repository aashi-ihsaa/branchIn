import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Typography, MenuItem, Select } from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';

const MessageTable = () => {
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedCannedMessage, setSelectedCannedMessage] = useState({});

  const cannedMessages = [
    "Thank you for reaching out! We will get back to you shortly.",
    "We are currently processing your request.",
    "Please provide more details to help us assist you better.",
    "Your application is under review. We will notify you once approved.",
  ];

  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });

    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages');
        const sortedMessages = sortMessages(res.data);
        setMessages(sortedMessages);
        setFilteredMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    socket.on('newMessage', (newMessage) => {
      const updatedMessages = [...messages, newMessage];
      const sortedMessages = sortMessages(updatedMessages);
      setMessages(sortedMessages);
      setFilteredMessages(sortedMessages);
    });

    socket.on('messageUpdate', (updatedMessage) => {
      const updatedMessages = messages.map((msg) =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      );
      const sortedMessages = sortMessages(updatedMessages);
      setMessages(sortedMessages);
      setFilteredMessages(sortedMessages);
    });

    return () => {
      socket.disconnect();
    };
  }, [messages]);

  const sortMessages = (messages) => {
    return messages.sort((a, b) => {
      if (a.urgency_level === 'high' && b.urgency_level !== 'high') return -1;
      if (a.urgency_level !== 'high' && b.urgency_level === 'high') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = messages.filter(
      (msg) =>
        msg.customer_id.toString().includes(query) || msg.message.toLowerCase().includes(query)
    );
    setFilteredMessages(filtered);
  };

  const handleCannedMessageSelect = (id, message) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [id]: message,
    }));
    setSelectedCannedMessage((prevSelected) => ({
      ...prevSelected,
      [id]: message,
    }));
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">Agent Portal</Typography>

      <TextField
        label="Search by Customer ID or Message"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearch}
        fullWidth
        margin="normal"
        sx={{ marginBottom: 3 }}
      />

      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Customer ID</TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Message</TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Urgency</TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Response</TableCell>
            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMessages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{message.customer_id}</TableCell>
              <TableCell>{message.message}</TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    color: message.urgency_level === 'high' ? '#d32f2f' : 'inherit',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '5px',
                    border: message.urgency_level === 'high' ? '1px solid #d32f2f' : 'none',
                  }}
                >
                  {message.urgency_level === 'high' ? 'High' : 'Normal'}
                </Typography>
              </TableCell>
              <TableCell>
                {message.response ? (
                  <Typography>{message.response}</Typography>
                ) : (
                  <div>
                    <TextField
                      value={responses[message.id] || ''}
                      onChange={(e) => handleReplyChange(message.id, e.target.value)}
                      placeholder="Type your response"
                      fullWidth
                      variant="outlined"
                    />
                    <Select
                      value={selectedCannedMessage[message.id] || ''}
                      onChange={(e) => handleCannedMessageSelect(message.id, e.target.value)}
                      displayEmpty
                      sx={{ marginTop: 1, width: '100%' }}
                    >
                      <MenuItem value="" disabled>Select Canned Message</MenuItem>
                      {cannedMessages.map((msg, index) => (
                        <MenuItem key={index} value={msg}>{msg}</MenuItem>
                      ))}
                    </Select>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {!message.response && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReply(message.id)}
                    sx={{
                      backgroundColor: '#3f51b5',
                      '&:hover': {
                        backgroundColor: '#303f9f',
                      },
                    }}
                  >
                    Reply
                  </Button>
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
