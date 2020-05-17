import React, { useRef, useCallback, createContext } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import TweetCard, { LoadingCard } from "./TweetCard";

export default function InfiniteList({
  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  //@ts-ignore
  isNextPageLoading,

  // Array of items loaded so far.
  //@ts-ignore
  items,

  // Callback function responsible for loading the next page of items.
  //@ts-ignore
  loadNextPage,
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = items.length + 1;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

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
