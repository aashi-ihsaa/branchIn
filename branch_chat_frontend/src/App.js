import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import MessageTable from './MessageTable';  // For the agent portal
import CustomerMessageForm from './CustomerMessageForm';  // For the customer portal

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/agent">Agent Portal</Link></li>
            <li><Link to="/customer">Customer Portal</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/agent" element={<MessageTable />} />
          <Route path="/customer" element={<CustomerMessageForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
