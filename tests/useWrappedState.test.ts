/**
 * NOTE: These tests need Jest to run properly
 * Install Jest with: npm install --save-dev jest @types/jest ts-jest
 * 
 * Tests for useWrappedState hook - original test code preserved as comments below
 */

/*
import { renderHook, act } from '@testing-library/react';
import { useWrappedState } from '../hooks/useWrappedState';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useWrappedState', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should show wrapped content when available and not viewed', () => {
    const { result } = renderHook(() => useWrappedState({ isAvailable: true }));
    
    expect(result.current.hasViewed).toBe(false);
    expect(result.current.shouldPrompt).toBe(true);
  });
  
  it('should not show wrapped content when not available', () => {
    const { result } = renderHook(() => useWrappedState({ isAvailable: false }));
    
    expect(result.current.hasViewed).toBe(false);
    expect(result.current.shouldPrompt).toBe(false);
  });
  
  it('should mark wrapped as viewed', () => {
    const { result } = renderHook(() => useWrappedState({ isAvailable: true }));
    
    act(() => {
      result.current.setHasViewed(true);
    });
    
    expect(result.current.hasViewed).toBe(true);
    expect(result.current.shouldPrompt).toBe(false);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('classProWrappedViewed-undefined', 'true');
  });
  
  it('should remember viewed state using localStorage', () => {
    // Set up localStorage to show as already viewed
    mockLocalStorage.getItem.mockReturnValue('true');
    
    const { result } = renderHook(() => useWrappedState({ 
      isAvailable: true,
      semesterId: '2025-1'
    }));
    
    expect(result.current.hasViewed).toBe(true);
    expect(result.current.shouldPrompt).toBe(false);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('classProWrappedViewed-2025-1');
  });
});
*/
