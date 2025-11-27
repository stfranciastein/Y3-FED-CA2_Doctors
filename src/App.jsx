import { BrowserRouter as Router, Routes, Route } from "react-router";
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';

export default function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </Router>
    </>
  )
}