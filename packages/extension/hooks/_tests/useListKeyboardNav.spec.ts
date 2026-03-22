import { type KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useListKeyboardNav } from '../useListKeyboardNav';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

function fakeKeyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

function useCallHook(
  overrides: {
    items?: { id: string }[];
    selectedId?: string | undefined;
    onSelect?: (id: string, index: number) => void;
    activeDescendantId?: (id: string) => string;
  } = {},
) {
  return useListKeyboardNav({
    items: overrides.items ?? items,
    selectedId: overrides.selectedId,
    onSelect: overrides.onSelect ?? vi.fn(),
    activeDescendantId: overrides.activeDescendantId,
  });
}

describe('useListKeyboardNav', () => {
  describe('onKeyDown - ArrowDown', () => {
    it('selects the first item when nothing is selected', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ onSelect });

      const event = fakeKeyEvent('ArrowDown');
      onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith('a', 0);
    });

    it('advances to the next item', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'a', onSelect });

      onKeyDown(fakeKeyEvent('ArrowDown'));

      expect(onSelect).toHaveBeenCalledWith('b', 1);
    });

    it('no-ops at the end of the list', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'c', onSelect });

      onKeyDown(fakeKeyEvent('ArrowDown'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('no-ops when items is empty', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ items: [], onSelect });

      onKeyDown(fakeKeyEvent('ArrowDown'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('no-ops when selectedId is not in items', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'missing', onSelect });

      onKeyDown(fakeKeyEvent('ArrowDown'));

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown - ArrowUp', () => {
    it('selects the previous item', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'b', onSelect });

      const event = fakeKeyEvent('ArrowUp');
      onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith('a', 0);
    });

    it('no-ops at the start of the list', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'a', onSelect });

      onKeyDown(fakeKeyEvent('ArrowUp'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('no-ops when nothing is selected', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ onSelect });

      onKeyDown(fakeKeyEvent('ArrowUp'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('no-ops when selectedId is not in items', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'missing', onSelect });

      onKeyDown(fakeKeyEvent('ArrowUp'));

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown - other keys', () => {
    it('ignores non-arrow keys', () => {
      const onSelect = vi.fn();
      const { onKeyDown } = useCallHook({ selectedId: 'a', onSelect });

      const event = fakeKeyEvent('Enter');
      onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('activeDescendant', () => {
    it('returns undefined when nothing is selected', () => {
      const { activeDescendant } = useCallHook();
      expect(activeDescendant).toBeUndefined();
    });

    it('returns the selectedId when no mapping function is provided', () => {
      const { activeDescendant } = useCallHook({ selectedId: 'b' });
      expect(activeDescendant).toBe('b');
    });

    it('returns the mapped ID when activeDescendantId is provided', () => {
      const { activeDescendant } = useCallHook({
        selectedId: 'b',
        activeDescendantId: (id) => `cell-${id}`,
      });
      expect(activeDescendant).toBe('cell-b');
    });

    it('returns undefined when selectedId is not in items', () => {
      const { activeDescendant } = useCallHook({ selectedId: 'missing' });
      expect(activeDescendant).toBeUndefined();
    });
  });
});
