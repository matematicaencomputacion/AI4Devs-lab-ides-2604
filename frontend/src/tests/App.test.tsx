import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renderiza el formulario para añadir candidato', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /añadir candidato/i });
  expect(heading).toBeInTheDocument();
});
