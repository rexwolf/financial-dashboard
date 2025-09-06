import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock axios to avoid ESM parsing issues in Jest
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    create: () => ({ get: jest.fn(), post: jest.fn() }),
  },
}));

// Mock storageService to avoid IndexedDB in Jest
jest.mock('./services/storageService', () => ({
  __esModule: true,
  storageService: {
    getMarketData: jest.fn().mockResolvedValue(null),
    storeMarketData: jest.fn().mockResolvedValue(undefined),
    getUserWatchlist: jest.fn().mockResolvedValue(null),
    storeUserWatchlist: jest.fn().mockResolvedValue(undefined),
    clearExpiredData: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    deleteMarketData: jest.fn().mockResolvedValue(undefined),
  },
}));

import App from './App';

test('renders app header', async () => {
  render(<App />);
  expect(await screen.findByText(/MonkeyTradingClub/i)).toBeInTheDocument();
});
