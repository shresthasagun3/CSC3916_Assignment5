import './App.css';
import MovieHeader from './components/movieheader';
import MovieList from './components/movielist';
import Movie from './components/movie';
import Authentication from './components/authentication';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function App() {
  const loggedIn = useSelector((state) => state.auth.loggedIn);

  return (
    <div className="App">
      <HashRouter>
        <MovieHeader />
        <Routes>
          <Route path="/" element={loggedIn ? <Navigate to="/movielist" /> : <Navigate to="/signin" />} />
          <Route path="/movielist" element={loggedIn ? <MovieList /> : <Navigate to="/signin" />} />
          <Route path="/movie/:movieId" element={loggedIn ? <Movie /> : <Navigate to="/signin" />} />
          <Route path="/signin" element={loggedIn ? <Navigate to="/movielist" /> : <Authentication />} />
          <Route path="/signup" element={loggedIn ? <Navigate to="/movielist" /> : <Authentication />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;