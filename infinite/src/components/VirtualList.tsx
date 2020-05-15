import React from "react";
import { FixedSizeList } from "react-window";
import TweetCard from "./TweetCard";

const VirtualList = ({ onItemsRendered, tweets }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TweetCard {...tweets[index]} />
    </div>
  );

  return (
    <FixedSizeList
      onItemsRendered={onItemsRendered}
      className="List"
      height={1000}
      itemCount={tweets.length}
      itemSize={155}
      width={650}
    >
      {Row}
    </FixedSizeList>
  );
};

export default VirtualList;
