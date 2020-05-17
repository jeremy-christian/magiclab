import React from "react";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import TweetCard, { LoadingCard } from "./TweetCard";
import { Tweet } from "../model";

export default function InfiniteList({
  isNextPageLoading,
  items,
  loadNextPage,
  setCurrentStartIndex,
}: {
  isNextPageLoading: boolean;
  items: Tweet[];
  loadNextPage: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void[] | void>;
  setCurrentStartIndex: (index: number) => void;
}) {
  // Add an extra row to hold loading indicators
  const itemCount = items.length + 1;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading
    ? () => new Promise(() => {})
    : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) => {
    return !!items[index] && !items[index].loading;
  };

  interface ItemProps {
    index: number;
    style: React.CSSProperties;
  }

  // conditionally render either placeholder cards or the tweets themselves if they're loaded
  const ListItem: React.FC<ItemProps> = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return <LoadingCard style={style} />;
    }
    return <TweetCard style={style} {...items[index]} />;
  };

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => {
        return (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeList
                height={height}
                itemCount={itemCount + 10}
                itemSize={200}
                onItemsRendered={(args) => {
                  setCurrentStartIndex(args.visibleStartIndex);
                  onItemsRendered(args);
                }}
                ref={ref}
                width={width}
              >
                {ListItem}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
}
