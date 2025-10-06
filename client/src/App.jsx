import react from 'react';
import { BrowserRouter , Routes , Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';

function App() {
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
