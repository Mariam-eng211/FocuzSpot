import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Explore from './pages/Explore';
import LocationDetail from './pages/LocationDetail';
import Discover from './pages/Discover';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import TabBar from './components/TabBar';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      <TabBar />
    </>
  );
}