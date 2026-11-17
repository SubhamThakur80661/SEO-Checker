import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('shows the login screen when signed out', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(await screen.findByText(/continue as guest/i)).toBeInTheDocument();
});
