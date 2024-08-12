import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [playlistId, setPlaylistId] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState('');
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  useEffect(() => {
    if (playlistId) {
      fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}&key=AIzaSyD-LRWs9bqPInRzTfVYD87pTbrFb7GZSCg`)
        .then(response => response.json())
        .then(data => {
          const videoItems = data.items.map(item => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url, 
          }));
          setVideos(videoItems);
          if (videoItems.length > 0) {
            setCurrentVideo(videoItems[0].videoId);
          }
        })
        .catch(error => console.error('Error fetching playlist:', error));
    }
  }, [playlistId]);

  const startStop = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (seconds) => {
    const getMinutes = `0${Math.floor(seconds / 60)}`.slice(-2);
    const getSeconds = `0${seconds % 60}`.slice(-2);
    return `${getMinutes}:${getSeconds}`;
  };

  const handlePlaylistChange = (e) => {
    const url = e.target.value;
    const idMatch = url.match(/list=([^&]+)/); 
    const id = idMatch ? idMatch[1] : '';
    if (id) {
      setPlaylistId(id);
    } else {
      console.error('Invalid playlist URL');
    }
  };

  const handleVideoChange = (videoId) => {
    setCurrentVideo(videoId);
  };

  const clearPlaylist = () => {
    setPlaylistId('');
    setVideos([]);
    setCurrentVideo('');
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  // To-Do List Functions
  const handleAddTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const handleToggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const handleDeleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div className="container">
      <div className="top-row">
        <div className="stopwatch-container">
          <h1>TIMER</h1>
          <p>Use the timer to keep track of your time</p>
          <h2>{formatTime(time)}</h2>
          <button onClick={startStop}>{isActive ? 'Pause' : 'Start'}</button>
          <button onClick={reset}>Reset</button>
        </div>

        <div className="todo-list-container">
          <h3>To-Do List</h3>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task"
          />
          <button onClick={handleAddTodo}>Add</button>
          <ul className="todo-list">
            {todos.map((todo, index) => (
              <li key={index} className={todo.completed ? 'completed' : ''}>
                <span onClick={() => handleToggleTodo(index)}>{todo.text}</span>
                <button onClick={() => handleDeleteTodo(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="playlist-container">
        <div className="video-player">
          <h2>Add Your YouTube Playlist</h2>
          <p>Don't get distracted, Use add playlist feature</p>
          <input
            type="text"
            placeholder="Enter YouTube playlist URL"
            onBlur={handlePlaylistChange}
          />
          <div className="player">
            {currentVideo && <YouTube videoId={currentVideo} opts={opts} />}
          </div>
        </div>

        {videos.length > 0 && (
          <div className="video-list-container">
            <button className="clear-button" onClick={clearPlaylist}>
              Clear Playlist
            </button>
            <ul className="video-list">
              {videos.map(video => (
                <li key={video.videoId}>
                  <img src={video.thumbnail} alt={video.title} />
                  <button onClick={() => handleVideoChange(video.videoId)}>
                    {video.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
