import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Router from './router/Router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
