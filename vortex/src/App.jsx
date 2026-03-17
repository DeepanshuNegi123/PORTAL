import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Base from './pages/Base'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/*  here we have used params after base :/roomId to travel with params  */}
        <Route path="/base/:roomId" element={<Base />} />
        {/* below we have a path where we are sending the paths that are not authorized */}
        <Route path="*" element={<NotFound />} />    
      </Routes>
    </BrowserRouter>
  )
}

export default App