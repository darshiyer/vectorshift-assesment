import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pipeline studio', () => {
  render(<App />);
  const title = screen.getByText(/Pipeline Studio/i);
  expect(title).toBeInTheDocument();
});
