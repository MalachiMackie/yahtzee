import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Let's play some Yahtzee!/i);
  expect(welcomeElement).toBeInTheDocument();
});
