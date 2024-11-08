import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Button, Container, Box, Typography } from '@mui/material';
import MessageTable from './MessageTable';  // Agent portal
import CustomerMessageForm from './CustomerMessageForm';  // Customer portal
import './App.css';

function App() {
  return (
    <Router>
      <Container maxWidth="md" className="App">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to the Messaging Portal
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 3 }}>
            <Button
              component={Link}
              to="/agent"
              variant="contained"
              color="primary"
              size="large"
            >
              Agent Portal
            </Button>
            <Button
              component={Link}
              to="/customer"
              variant="outlined"
              color="secondary"
              size="large"
            >
              Customer Portal
            </Button>
          </Box>
        </Box>
        <Routes>
          <Route path="/agent" element={<MessageTable />} />
          <Route path="/customer" element={<CustomerMessageForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
