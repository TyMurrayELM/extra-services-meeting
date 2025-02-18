import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ExtrasDepartmentMeeting from './components/ExtrasDepartmentMeeting'

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ExtrasDepartmentMeeting />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App