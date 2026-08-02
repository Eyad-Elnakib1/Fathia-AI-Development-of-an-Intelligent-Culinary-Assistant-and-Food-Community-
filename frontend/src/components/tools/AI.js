import React, { useState } from 'react';
import './AI.css';
import { generateAiRecipe } from '../../services/aiService';
import Navbar from '../common/Navbar';

const AI = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('Ya welcome Ya Welcome 3aleko...Ma3ako Fatheia AI ol el3andak wana hasandak');
  const [loading, setLoading] = useState(false);

  const handleSubmitPrompt = async () => {
    if (prompt.trim() && !loading) {
      try {
        setLoading(true);
        const res = await generateAiRecipe(prompt);
        setResponse(res.response || 'No response generated.');
        setPrompt('');
      } catch (error) {
        console.error('Error fetching AI response:', error);
        setResponse('Error: Could not get AI response. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitPrompt();
    }
  };

  // Helper to parse markdown **bold** text into clean JSX <strong> elements
  const renderFormattedResponse = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Match markdown bold pattern **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <React.Fragment key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
              return <strong key={partIndex} style={{ color: '#000', fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="ai-page">
      <Navbar activePage="/ai" />

      <div className="ai-response-window">
        <div className="ai-decor ai-top-left"></div>
        <div className="ai-decor ai-top-right"></div>
        <div className="ai-decor ai-bottom-left"></div>
        <div className="ai-decor ai-bottom-right"></div>
        <div className="ai-response-content">
          {loading ? 'Fatheia is thinking... 🤔' : renderFormattedResponse(response)}
        </div>
      </div>

      <div className="ai-small-circle-1"></div>
      <div className="ai-small-circle-2"></div>

      <div className="ai-prompt-bar">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your prompt here..."
          disabled={loading}
        />
        <button onClick={handleSubmitPrompt} disabled={loading}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default AI;
