import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);

    if (onRecordingComplete) {
      onRecordingComplete(null);
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
      {!isRecording && !audioUrl && (
        <button 
          onClick={startRecording}
          type="button"
          className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md px-3 py-1 transition-colors"
        >
          <Mic className="w-4 h-4 mr-2" />
          Record Audio
        </button>
      )}

      {isRecording && (
        <button 
          onClick={stopRecording}
          type="button"
          className="flex items-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-2 transition-colors animate-pulse"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop Recording
        </button>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center space-x-3">
          <audio src={audioUrl} controls className="h-10 w-64" />
          <button 
            onClick={clearRecording}
            type="button"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete recording"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
