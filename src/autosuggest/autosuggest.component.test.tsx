import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Autosuggest } from './autosuggest.component';
import { Search } from '@carbon/react'; // Import Search for type casting

// Mock Carbon components
jest.mock('@carbon/react', () => ({
  ...jest.requireActual('@carbon/react'),
  Search: jest.fn(({ onChange, onClear, value, ...rest }) => (
    <input
      data-testid="search-input"
      onChange={onChange}
      onBlur={onClear} // Simplified for mock: onClear is often a blur/clear button
      value={value || ''}
      {...rest}
    />
  )),
  Layer: jest.fn(({ children }) => <>{children}</>),
}));

describe('Autosuggest Component', () => {
  const mockGetDisplayValue = jest.fn((item) => item.display);
  const mockGetFieldValue = jest.fn((item) => item.value);
  const mockGetSearchResults = jest.fn();
  const mockOnSuggestionSelected = jest.fn();
  const mockRenderEmptyState = jest.fn((searchValue) => <div>No results for {searchValue}</div>);
  const mockRenderSuggestionItem = jest.fn((item) => <span>Custom: {item.display}</span>);

  const defaultProps = {
    id: 'test-autosuggest',
    labelText: 'Test Label',
    getDisplayValue: mockGetDisplayValue,
    getFieldValue: mockGetFieldValue,
    getSearchResults: mockGetSearchResults,
    onSuggestionSelected: mockOnSuggestionSelected,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Search ref
    const mockSearchRef = { current: { value: '' } };
    (Search as jest.Mock).mockImplementation(({ onChange, onClear, ref, ...rest }) => {
      if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = mockSearchRef.current as any;
      }
      return (
        <input
          data-testid="search-input"
          onChange={(e) => {
            mockSearchRef.current.value = e.target.value;
            onChange(e);
          }}
          onBlur={onClear}
          ref={ref}
          {...rest}
        />
      );
    });
  });

  test('renders with labelText', () => {
    render(<Autosuggest {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  test('calls getSearchResults on input change and displays suggestions', async () => {
    const suggestions = [
      { display: 'Suggestion 1', value: '1' },
      { display: 'Suggestion 2', value: '2' },
    ];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockGetSearchResults).toHaveBeenCalledWith('test');
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    });
  });

  test('calls onSuggestionSelected when a suggestion is clicked', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: 'value1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'sugg' } });

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suggestion 1'));

    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', 'value1');
    // Input value should be updated by the component logic
    // We need to ensure the ref is correctly handled in the mock for this
    // For now, we check if suggestions disappear
    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  test('clears suggestions and calls onSuggestionSelected with undefined on input clear', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'test' } });
    await waitFor(() => expect(screen.getByText('Suggestion 1')).toBeInTheDocument());

    // Simulate clear event (e.g., user clears input or onClear is triggered)
    // The mocked Search component calls onClear on blur.
    fireEvent.blur(input); // This will trigger onClear in the mock
    // Or, if Search had a clear button, we'd click that.
    // For a direct test of handleClear, we might need to expose it or refactor.

    // A more direct way to test handleClear if it was tied to the input's value becoming empty:
    fireEvent.change(input, { target: { value: '' } });
    // Then onClear might be called by the actual Search component, or we call it if it's passed.
    // The current mock calls onClear on blur.

    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', undefined);
    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  test('renders empty state when getSearchResults returns empty array and renderEmptyState is provided', async () => {
    mockGetSearchResults.mockResolvedValue([]);
    render(<Autosuggest {...defaultProps} renderEmptyState={mockRenderEmptyState} />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'empty' } });

    await waitFor(() => {
      expect(mockGetSearchResults).toHaveBeenCalledWith('empty');
      expect(screen.getByText('No results for empty')).toBeInTheDocument();
    });
  });

  test('does not render empty state if input length is less than 3', async () => {
    mockGetSearchResults.mockResolvedValue([]);
    render(<Autosuggest {...defaultProps} renderEmptyState={mockRenderEmptyState} />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'em' } }); // Length 2

    await waitFor(() => {
      expect(mockGetSearchResults).toHaveBeenCalledWith('em');
    });
    // Empty state should not be visible
    expect(screen.queryByText('No results for em')).not.toBeInTheDocument();
  });

  test('renders custom suggestion item when renderSuggestionItem is provided', async () => {
    const suggestions = [{ display: 'Item 1', value: 'val1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);
    render(<Autosuggest {...defaultProps} renderSuggestionItem={mockRenderSuggestionItem} />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'item' } });

    await waitFor(() => {
      expect(screen.getByText('Custom: Item 1')).toBeInTheDocument();
      expect(mockRenderSuggestionItem).toHaveBeenCalledWith(suggestions[0]);
    });
  });

  test('displays invalid message when invalid prop is true', () => {
    render(<Autosuggest {...defaultProps} invalid={true} invalidText="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    // Check for invalid class if specific styling is applied
    // const searchContainer = screen.getByTestId('search-input').closest('div.cds--layer'); // Adjust selector
    // if (searchContainer) {
    //   expect(searchContainer).toHaveClass('your-invalid-class-on-layer-if-any');
    // }
  });

  test('hides suggestions when clicking outside the component', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(
      <div>
        <Autosuggest {...defaultProps} />
        <button>Outside Button</button>
      </div>,
    );
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'test' } });
    await waitFor(() => expect(screen.getByText('Suggestion 1')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByText('Outside Button'));

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });
});
