import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentChatProps {
  isOpen: boolean;
}

const InputBar = styled.div<{ isOpen: boolean }>`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%) ${props => props.isOpen ? 'translateY(0)' : 'translateY(120px)'};
  width: 90%;
  max-width: 800px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 24px;
  gap: 12px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  pointer-events: ${props => props.isOpen ? 'all' : 'none'};
  transition: all 0.3s ease;
  z-index: 999;
  border: 1px solid #e0e0e0;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #1a202c;
  background: transparent;

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.disabled ? '#e0e0e0' : 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'};
  color: white;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AgentChat: React.FC<AgentChatProps> = ({ isOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.medforce-ai.com/send-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMessages),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };

      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <InputBar isOpen={isOpen}>
        <Input
          type="text"
          placeholder="Ask MedForce Clinical Agent anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoFocus={isOpen}
        />
        <SendButton onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
          {isLoading ? <Loader style={{ animation: 'spin 1s linear infinite' }} /> : <Send />}
        </SendButton>
      </InputBar>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AgentChat;
