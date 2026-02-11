import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  path?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], path = '/', ...renderOptions }: RenderWithRouterOptions = {},
) {
  const routes = [
    {
      path,
      element: ui,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries,
  });

  return render(<RouterProvider router={router} />, renderOptions);
}
