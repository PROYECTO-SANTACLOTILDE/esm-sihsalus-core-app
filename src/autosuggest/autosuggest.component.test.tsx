import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Autosuggest } from './autosuggest.component';
import styles from './autosuggest.scss';

const mockGetDisplayValue = jest.fn((item) => item.display);
const mockGetFieldValue = jest.fn((item) => item.value);
const mockGetSearchResults = jest.fn();
const mockOnSuggestionSelected = jest.fn();
const mockRenderEmptyState = jest.fn((searchValue) => <div>No results for {searchValue}</div>);
const mockRenderSuggestionItem = jest.fn((item) => <div>Custom: {item.display}</div>);

const defaultProps = {
  id: 'test-autosuggest',
  labelText: 'Test Autosuggest',
  getDisplayValue: mockGetDisplayValue,
  getFieldValue: mockGetFieldValue,
  getSearchResults: mockGetSearchResults,
  onSuggestionSelected: mockOnSuggestionSelected,
};

describe('Autosuggest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    render(<Autosuggest {...defaultProps} />);
    expect(screen.getByLabelText('Test Autosuggest')).toBeInTheDocument();
  });

  it('calls getSearchResults when input changes and displays suggestions', async () => {
    const suggestions = [
      { display: 'Suggestion 1', value: '1' },
      { display: 'Suggestion 2', value: '2' },
    ];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', undefined);
    expect(mockGetSearchResults).toHaveBeenCalledWith('test');

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    });
  });

  it('calls onSuggestionSelected with the correct value when a suggestion is clicked', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suggestion 1'));

    expect(mockGetDisplayValue).toHaveBeenCalledWith(suggestions[0]);
    expect(mockGetFieldValue).toHaveBeenCalledWith(suggestions[0]);
    expect(input).toHaveValue('Suggestion 1');
    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', '1');
    expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument(); // Suggestions should hide
  });

  it('calls onSuggestionSelected with undefined when input is cleared', async () => {
    render(<Autosuggest {...defaultProps} value="initial" />);
    const clearButton = screen.getByRole('button', { name: /clear search input/i });

    fireEvent.click(clearButton);
    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', undefined);
  });

  it('renders empty state when no suggestions are found and renderEmptyState is provided', async () => {
    mockGetSearchResults.mockResolvedValue([]);
    render(<Autosuggest {...defaultProps} renderEmptyState={mockRenderEmptyState} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockGetSearchResults).toHaveBeenCalledWith('test');
    });

    // Wait for the empty state to appear
    await waitFor(() => {
      expect(screen.getByText('No results for test')).toBeInTheDocument();
    });
    expect(mockRenderEmptyState).toHaveBeenCalledWith('test');
  });

  it('displays invalid state and message when invalid prop is true', () => {
    render(<Autosuggest {...defaultProps} invalid={true} invalidText="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    // We can also check for a specific class if one is applied for invalid state
    // For example, if the wrapper div gets a class like 'autocomplete--invalid'
    // expect(screen.getByLabelText('Test Autosuggest').closest('div.autocomplete')).toHaveClass('autocomplete--invalid');
    // The Carbon Search component itself might have an invalid state, or the Layer around it
    const searchInput = screen.getByRole('searchbox');
    // Carbon components often use data attributes for state
    // expect(searchInput).toHaveAttribute('data-invalid', 'true');
    // The Layer component itself will have the invalid class.
    // The Search input is a child of the Search component, which is a child of Layer.
    const searchComponentWrapper = screen.getByRole('searchbox').closest('div.cds--search');
    expect(searchComponentWrapper).toBeInTheDocument();
    const layerElement = searchComponentWrapper.parentElement;
    expect(layerElement).toHaveClass(styles.invalid); // styles.invalid from autosuggest.scss
  });

  it('uses renderSuggestionItem to render suggestion items if provided', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} renderSuggestionItem={mockRenderSuggestionItem} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Custom: Suggestion 1')).toBeInTheDocument();
    });
    expect(mockRenderSuggestionItem).toHaveBeenCalledWith(suggestions[0]);
  });

  it('hides suggestions when clicking outside the component', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(
      <div data-testid="outside-area">
        <Autosuggest {...defaultProps} />
      </div>,
    );
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByTestId('outside-area'));

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  it('does not show empty state if search query is less than 3 characters', async () => {
    mockGetSearchResults.mockResolvedValue([]);
    render(<Autosuggest {...defaultProps} renderEmptyState={mockRenderEmptyState} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'te' } }); // Query less than 3 chars

    await waitFor(() => {
      expect(mockGetSearchResults).toHaveBeenCalledWith('te');
    });

    // Empty state should not be visible
    expect(screen.queryByText('No results for te')).not.toBeInTheDocument();
    expect(mockRenderEmptyState).not.toHaveBeenCalled();
  });

  it('clears suggestions when input value is empty', async () => {
    const suggestions = [{ display: 'Suggestion 1', value: '1' }];
    mockGetSearchResults.mockResolvedValue(suggestions);

    render(<Autosuggest {...defaultProps} />);
    const input = screen.getByRole('searchbox');

    // First, type something to get suggestions
    fireEvent.change(input, { target: { value: 'test' } });
    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    // Then, clear the input
    fireEvent.change(input, { target: { value: '' } });
    expect(mockOnSuggestionSelected).toHaveBeenCalledWith('test-autosuggest', undefined);

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
    // Ensure getSearchResults is not called with empty string if that's the desired behavior
    // Based on the component logic: if (query) { getSearchResults(query)... }
    // So, it should not be called again with an empty string after the 'test' call.
    expect(mockGetSearchResults).toHaveBeenCalledTimes(1); // Only called for 'test'
  });
});
