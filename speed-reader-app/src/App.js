import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Upload } from 'lucide-react';

export default function SpeedReader() {
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const intervalRef = useRef(null);

  // Calculate ORP (Optimal Recognition Point) - usually slightly left of center
  const getORPIndex = (word) => {
    const len = word.length;
    if (len === 1) return 0;
    if (len === 2) return 0;
    if (len === 3) return 1;
    return Math.floor((len - 1) / 2);
  };

  // Split word into parts with ORP highlighted
  const renderWord = (word) => {
    if (!word) return null;
    const orpIndex = getORPIndex(word);
    return (
      <div className="text-6xl font-mono font-bold tracking-wide">
        <span className="text-gray-800">{word.slice(0, orpIndex)}</span>
        <span className="text-red-600">{word[orpIndex]}</span>
        <span className="text-gray-800">{word.slice(orpIndex + 1)}</span>
      </div>
    );
  };

  // Process text into words
  const processText = (inputText) => {
    const wordArray = inputText
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWords(wordArray);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  // Handle text input change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    processText(newText);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileText = event.target.result;
      setText(fileText);
      processText(fileText);
    };
    reader.readAsText(file);
  };

  // Play/Pause control
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = 60000 / wpm; // Convert WPM to milliseconds
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, wpm, words.length]);

  const togglePlay = () => {
    if (words.length === 0) return;
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Speed Reader</h1>
        <p className="text-gray-600 mb-8">Train your brain to read faster with RSVP technique</p>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your text or upload a file
            </label>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Paste your text here to start speed reading..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <Upload size={20} />
              <span className="text-sm font-medium">Upload .txt file</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              {words.length} words loaded
            </span>
          </div>
        </div>

        {/* Display Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 mb-6">
          <div className="flex items-center justify-center h-40">
            {words.length > 0 ? (
              renderWord(words[currentIndex])
            ) : (
              <p className="text-gray-400 text-lg">Enter text above to begin</p>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Word {currentIndex + 1} of {words.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                disabled={words.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span className="font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                onClick={reset}
                disabled={words.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw size={20} />
                <span className="font-medium">Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Speed:</label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-bold text-gray-800 w-20">{wpm} WPM</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>How to use:</strong> The red letter marks the optimal recognition point. Focus on it and let the words flow through your vision without moving your eyes.</p>
          </div>
        </div>
      </div>
    </div>
  ); 
}