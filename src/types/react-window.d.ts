declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps<TData = unknown> {
    index: number;
    style: React.CSSProperties;
    data: TData;
    isScrolling?: boolean;
  }

  interface BaseListProps<TData = unknown> {
    children: React.ComponentType<ListChildComponentProps<TData>>;
    className?: string;
    height: number;
    itemCount: number;
    itemData?: TData;
    itemKey?: (index: number, data: TData) => React.Key;
    overscanCount?: number;
    width: number | string;
    onScroll?: (props: {
      scrollDirection: 'forward' | 'backward';
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => void;
    direction?: 'vertical' | 'horizontal';
  }

  export class FixedSizeList<TData = unknown> extends React.Component<
    BaseListProps<TData> & {
      itemSize: number;
    }
  > {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
  }

  export class VariableSizeList<TData = unknown> extends React.Component<
    BaseListProps<TData> & {
      itemSize: (index: number) => number;
    }
  > {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
  }
}
