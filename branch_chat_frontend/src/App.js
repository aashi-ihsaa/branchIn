import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const res = await axios.get('http://localhost:5000/api/messages');
        setMessages(res.data);
    };

    const handleResponse = async (id) => {
        await axios.post(`http://localhost:5000/api/messages/${id}/respond`, { response });
        setResponse('');
        fetchMessages();
    };

    return (
        <div>
            <h1>Customer Support Dashboard</h1>
            <div className="message-list">
                {messages.map((msg) => (
                    <div key={msg.id} onClick={() => setSelectedMessage(msg)}>
                        <h3>{msg.message}</h3>
                    </div>
                ))}
            </div>
            {selectedMessage && (
                <div>
                    <h2>Reply to: {selectedMessage.message}</h2>
                    <textarea value={response} onChange={(e) => setResponse(e.target.value)} />
                    <button onClick={() => handleResponse(selectedMessage.id)}>Send</button>
                </div>
            )}
        </div>
    );
}

export default App;
