import React, { useEffect, useState } from 'react';
import { TextField, Stack, PrimaryButton } from '@fluentui/react';
import axios, { AxiosError } from 'axios';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/origineStore";

export default function AiChat() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const API_URL = 'https://api.openai.com/v1/';
  const MODEL = 'gpt-3.5-turbo';
  const [API_KEY, setAPI_KEY] = useState('');

  const state = useSelector((state: RootState) => state.status.editor);
  
  const getGameConfig = () => {
    axios.get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`).then((r) => getApiKrey(r.data));
  };

  useEffect(() => {
    getGameConfig();
  }, []);

  const getApiKrey = (data: string) => {
    const match = data.match(/Api_Key:(.*?);/);
    if (match && match[1]) {
      setAPI_KEY(match[1]);
    }
  };

  const handleSend = async () => {
    setChatHistory((prevHistory) => [...prevHistory, `You: ${userInput}`]);
  
    try {
      const response = await axios.post(`${API_URL}chat/completions`, {
        model: MODEL,
        messages: [
          { 'role': 'user', 'content': userInput }
        ],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      const botResponse = response.data.choices[0].message.content;
      setChatHistory((prevHistory) => [...prevHistory, `ChatGPT: ${botResponse}`]);
    } catch (error) {
      console.error('Error calling GPT-3 API: ', error);
      setChatHistory((prevHistory) => [...prevHistory, `ChatGPT: I'm sorry, I couldn't process that request.`]);
    }
    setUserInput('');
  };

  const handleSave = () => {
    const data = chatHistory.join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setChatHistory(content.split('\n'));
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ height: "100%", overflow: "auto", display: "flex", flexFlow: "column" }}>
      <Stack tokens={{ childrenGap: 20 }}>
        <Stack tokens={{ childrenGap: 20 }}>
          <div style={{ width: "100%"}}>
            <TextField
              multiline
              rows={3}
              placeholder="Type your message"
              value={userInput}
              onChange={(e, newValue) => setUserInput(newValue || '')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <PrimaryButton onClick={handleSend} styles={{ root: { width: '60px' } }}>
              Send
            </PrimaryButton>
            <PrimaryButton onClick={handleSave}>
              Save
            </PrimaryButton>
            <input type="file" accept="text/plain" onChange={handleFileInput} />
          </div>
        </Stack>
        <div style={{ userSelect: "text" }}>
          {chatHistory.map((text, index) => (
            <div key={index}>{text}</div>
          ))}
        </div>  
      </Stack>
    </div>
  );
}