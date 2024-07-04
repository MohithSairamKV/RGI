import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in text', () => {
  render(<App />);
  const linkElement = screen.getByText(/sign in/i);
  expect(linkElement).toBeInTheDocument();
});
