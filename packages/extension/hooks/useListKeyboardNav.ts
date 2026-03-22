import { type KeyboardEvent } from 'react';

type UseListKeyboardNavOptions<T extends { id: string }> = {
  items: T[];
  selectedId: string | undefined;
  onSelect: (id: string, index: number) => void;
  activeDescendantId?: (id: string) => string;
};

type UseListKeyboardNavResult = {
  onKeyDown: (e: KeyboardEvent) => void;
  activeDescendant: string | undefined;
};

export function useListKeyboardNav<T extends { id: string }>(
  options: UseListKeyboardNavOptions<T>,
): UseListKeyboardNavResult {
  const { items, selectedId, onSelect, activeDescendantId } = options;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectNext(items, selectedId, onSelect);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectPrevious(items, selectedId, onSelect);
    }
  };

  const activeDescendant = getActiveDescendant(items, selectedId, activeDescendantId);

  return { onKeyDown, activeDescendant };
}

function selectNext<T extends { id: string }>(
  items: T[],
  selectedId: string | undefined,
  onSelect: (id: string, index: number) => void,
) {
  if (items.length === 0) {
    return;
  }

  if (selectedId === undefined) {
    onSelect(items[0].id, 0);
    return;
  }

  const currentIndex = items.findIndex((item) => item.id === selectedId);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex >= items.length) {
    return;
  }

  onSelect(items[nextIndex].id, nextIndex);
}

function selectPrevious<T extends { id: string }>(
  items: T[],
  selectedId: string | undefined,
  onSelect: (id: string, index: number) => void,
) {
  if (items.length === 0 || selectedId === undefined) {
    return;
  }

  const currentIndex = items.findIndex((item) => item.id === selectedId);
  if (currentIndex === -1) {
    return;
  }

  const previousIndex = currentIndex - 1;
  if (previousIndex < 0) {
    return;
  }

  onSelect(items[previousIndex].id, previousIndex);
}

function getActiveDescendant<T extends { id: string }>(
  items: T[],
  selectedId: string | undefined,
  activeDescendantId?: (id: string) => string,
): string | undefined {
  if (selectedId === undefined) {
    return undefined;
  }

  const isSelected = items.some((item) => item.id === selectedId);
  if (!isSelected) {
    return undefined;
  }

  return activeDescendantId ? activeDescendantId(selectedId) : selectedId;
}
