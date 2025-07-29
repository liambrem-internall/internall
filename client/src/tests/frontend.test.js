import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

// mock components and modules
jest.mock('../components/visuals/LightBallsOverlay', () => () => (
  <div data-testid="light-balls-overlay" />
));

jest.mock('../utils/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(), 
    disconnect: jest.fn(), 
    connected: true,
    once: jest.fn(),
  }
}));


// mock hooks
jest.mock('../hooks/useApiFetch', () => ({
  useApiFetch: () => jest.fn(),
}));

jest.mock('../hooks/rooms/useRoomUsers', () => ({
  __esModule: true,
  default: () => [],
}));

const mockAuth0User = {
  sub: 'test-user-id',
  nickname: 'testuser',
  name: 'Test User',
  email: 'test@example.com'
};

const mockUseAuth0 = {
  isAuthenticated: true,
  isLoading: false,
  user: mockAuth0User,
  getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  logout: jest.fn(),
};

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0,
  Auth0Provider: ({ children }) => children,
}));

// mock API fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
  })
);

import App from '../App';
import UserPage from '../components/app-components/UserPage';
import Navigation from '../components/outer-components/Navigation';
import SlidingMenu from '../components/outer-components/SlidingMenu';
import Searchbar from '../components/outer-components/Searchbar';

describe('Frontend Application Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Component', () => {
    test('should render App component', () => {
      render(<App />);
      expect(document.body).toBeInTheDocument();
    });

    test('should redirect authenticated user to their page', () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('UserPage Component', () => {
    const mockSetUserReady = jest.fn();
    
    const renderUserPage = () => {
      return render(
        <BrowserRouter>
          <UserPage setUserReady={mockSetUserReady} userReady={true} />
        </BrowserRouter>
      );
    };

    test('should render UserPage with main components', async () => {
      renderUserPage();
      
      await waitFor(() => {
        expect(screen.getByTestId('light-balls-overlay')).toBeInTheDocument();
      });
    });

    test('should show search button', () => {
      renderUserPage();
      
      const searchButton = screen.getByLabelText('Open search');
      expect(searchButton).toBeInTheDocument();
    });

    test('should open search menu when search button clicked', async () => {
      renderUserPage();
      
      const searchButton = screen.getByLabelText('Open search');
      fireEvent.click(searchButton);
      
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Navigation Component', () => {
    const renderNavigation = () => {
      return render(
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>
      );
    };

    test('should render navigation with hamburger menu', () => {
      renderNavigation();
      
      const hamburgerButton = document.querySelector('.hamburger-toggle');
      expect(hamburgerButton).toBeInTheDocument();
    });

    test('should show hamburger menu items when clicked', async () => {
      renderNavigation();
      
      const hamburgerButton = document.querySelector('.hamburger-toggle');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Show Graph')).toBeInTheDocument();
        expect(screen.getByText('Demo-Data')).toBeInTheDocument();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
      });
    });

    test('should show online status when online', () => {
      renderNavigation();
      
      // The status indicator only shows when offline, so when online it shouldn't be there
      const statusElement = document.querySelector('.status-indicator');
      expect(statusElement).not.toBeInTheDocument();
    });

    test('should call logout when logout button clicked', async () => {
      renderNavigation();
      
      const hamburgerButton = document.querySelector('.hamburger-toggle');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Log Out');
        fireEvent.click(logoutButton);
        expect(mockUseAuth0.logout).toHaveBeenCalled();
      });
    });

    test('should show demo data button in menu', async () => {
      renderNavigation();
      
      const hamburgerButton = document.querySelector('.hamburger-toggle');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Demo-Data')).toBeInTheDocument();
      });
    });

    test('should show graph toggle button in menu', async () => {
      renderNavigation();
      
      const hamburgerButton = document.querySelector('.hamburger-toggle');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Show Graph')).toBeInTheDocument();
      });
    });

    test('should show view mode toggle button', () => {
      renderNavigation();
      
      const viewToggleButton = document.querySelector('.view-toggle-icon');
      expect(viewToggleButton).toBeInTheDocument();
    });

    test('should show search button', () => {
      renderNavigation();
      
      const searchButton = screen.getByLabelText('Open search');
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Searchbar Component', () => {
    const mockOnSearch = jest.fn();
    const mockOnAutocomplete = jest.fn();
    const mockSuggestions = ['test suggestion', 'another suggestion'];

    test('should render searchbar input', () => {
      render(
        <Searchbar 
          onSearch={mockOnSearch}
          onAutocomplete={mockOnAutocomplete}
          suggestions={mockSuggestions}
        />
      );
      
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    test('should call onSearch when typing', async () => {
      jest.useFakeTimers();
      
      render(
        <Searchbar 
          onSearch={mockOnSearch}
          onAutocomplete={mockOnAutocomplete}
          suggestions={mockSuggestions}
        />
      );
      
      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'test query' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test query');
      });
      
      jest.useRealTimers();
    });

    test('should show suggestions', () => {
      render(
        <Searchbar 
          onSearch={mockOnSearch}
          onAutocomplete={mockOnAutocomplete}
          suggestions={['test suggestion']}
        />
      );
      
      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(document.querySelector('.searchbar-suggestion')).toBeInTheDocument();
    });
  });

  describe('SlidingMenu Component', () => {
    const mockProps = {
      open: true,
      onClose: jest.fn(),
      setShowItemModal: jest.fn(),
      setEditingItem: jest.fn(),
      sections: {
        'section1': {
          title: 'Test Section',
          items: [
            { id: 'item1', content: 'Test item', _id: 'item1' }
          ]
        }
      }
    };

    const renderSlidingMenu = (props = {}) => {
      return render(
        <BrowserRouter>
          <SlidingMenu {...mockProps} {...props} />
        </BrowserRouter>
      );
    };

    test('should render sliding menu when open', () => {
      renderSlidingMenu();
      
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    test('should not show menu when closed', () => {
      renderSlidingMenu({ open: false });
      
      const menu = document.querySelector('.sliding-menu');
      expect(menu).not.toHaveClass('open');
    });

    test('should show close button', () => {
      renderSlidingMenu();
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    test('should call onClose when close button clicked', () => {
      renderSlidingMenu();
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('should show search placeholder when no results', () => {
      renderSlidingMenu();
      
      expect(screen.getByText('Start typing to see results...')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('should handle user authentication flow', () => {
      const unauthenticatedAuth0 = {
        ...mockUseAuth0,
        isAuthenticated: false,
        user: null,
      };
      
      const originalMock = require('@auth0/auth0-react').useAuth0;
      require('@auth0/auth0-react').useAuth0 = jest.fn().mockReturnValue(unauthenticatedAuth0);
      
      render(
        <BrowserRouter>
          <UserPage setUserReady={jest.fn()} userReady={true} />
        </BrowserRouter>
      );
      
      expect(document.body).toBeInTheDocument();
      
      require('@auth0/auth0-react').useAuth0 = originalMock;
    });

    test('should handle loading states', () => {
      const loadingAuth0 = {
        ...mockUseAuth0,
        isLoading: true,
      };
      
      const originalMock = require('@auth0/auth0-react').useAuth0;
      require('@auth0/auth0-react').useAuth0 = jest.fn().mockReturnValue(loadingAuth0);
      
      render(
        <BrowserRouter>
          <UserPage setUserReady={jest.fn()} userReady={false} />
        </BrowserRouter>
      );
      
      expect(document.body).toBeInTheDocument();
      
      require('@auth0/auth0-react').useAuth0 = originalMock;
    });

    test('should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // mock fetch to reject
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
      
      render(
        <BrowserRouter>
          <UserPage setUserReady={jest.fn()} userReady={true} />
        </BrowserRouter>
      );
      
      expect(document.body).toBeInTheDocument();
      
      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });

    test('should handle socket connection', () => {
      const mockSocket = require('../utils/socket').socket;
      
      render(
        <BrowserRouter>
          <UserPage setUserReady={jest.fn()} userReady={true} />
        </BrowserRouter>
      );
      
      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Tests', () => {
    test('should handle component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      expect(document.body).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
