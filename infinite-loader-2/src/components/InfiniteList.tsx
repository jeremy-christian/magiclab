import React, { useRef, useCallback, createContext } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import TweetCard, { LoadingCard } from "./TweetCard";
import { Tweet } from "../model";

export default function InfiniteList({
  isNextPageLoading,
  items,
  loadNextPage,
}: {
  isNextPageLoading: boolean;
  items: Tweet[];
  loadNextPage: () => void;
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = items.length + 1;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading
    ? () => new Promise(() => {})
    : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  //@ts-ignore
  const isItemLoaded = (index) => index < items.length;

  // Render an item or a loading indicator.
  //@ts-ignore
  const Item = ({ index, style }) => {
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
            // @ts-ignore
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                className="List"
                height={height}
                itemCount={itemCount + 10}
                itemSize={200}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width={width}
              >
                {Item}
              </List>
            )}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
}
