import React from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import TweetCard, { LoadingCard } from "./TweetCard";

export default function InfiniteList({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  //@ts-ignore
  hasNextPage,

  //@ts-ignore
  setStartIndex,

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
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  //@ts-ignore
  const isItemLoaded = (index) => index < items.length;

  // Render an item or a loading indicator.
  //@ts-ignore
  const Item = ({ index, style }) => {
    let content;
    if (!isItemLoaded(index)) {
      content = <LoadingCard />;
    } else {
      content = <TweetCard {...items[index]} />;
    }

    return <div style={style}>{content}</div>;
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
                itemSize={155}
                onItemsRendered={(args) => {
                  setStartIndex(args.visibleStartIndex);
                  onItemsRendered(args);
                }}
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
