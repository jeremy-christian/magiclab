import ReactDOM from "react-dom";
import React, { useState } from "react";
import InfiniteList from "./components/InfiniteList";
import styled from "styled-components";
import { loadMissingTweets, loadInitialTweets } from "./api";
import { Tweet } from "./model";

const FullScreen = styled.div`
  width: 100%;
  height: 100vh;
`;

const App = () => {
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [items, setItems] = useState([] as Tweet[]);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);

  // this callback is called when the infinite loader needs more items
  const loadNextPage = (startIndex: number, stopIndex: number) => {
    setIsNextPageLoading(true);
    console.log({ startIndex, stopIndex });
    // if we already have tweets, load any missing tweets
    if (items.length > 0) {
      return loadMissingTweets(
        startIndex,
        stopIndex,
        items,
        setItems,
        setIsNextPageLoading
      );
    } else {
      // if we have no tweets, load the latest tweets and start looping calls for more
      return loadInitialTweets(setItems, setIsNextPageLoading);
    }
  };

  // React.useMemo(() => {
  //   console.log("startindex", currentStartIndex);
  // }, [currentStartIndex]);

  // React.useMemo(() => {
  //   items.forEach((item, index) => {
  //     if (index === items.length - 1) {
  //       return true;
  //     }
  //     const idsAreSequential = item.id === items[index + 1].id + 1;
  //     const timeStampsAreInOrder = item.timeStamp >= items[index + 1].timeStamp;
  //     if (!idsAreSequential || !timeStampsAreInOrder) {
  //       throw Error(
  //         `Fetch error: ${
  //           idsAreSequential
  //             ? "time stamps out of order"
  //             : "missing / duplicate tweet detected"
  //         }`
  //       );
  //     }
  //   });
  // }, [items]);

  return (
    <FullScreen>
      <InfiniteList
        setCurrentStartIndex={setCurrentStartIndex}
        isNextPageLoading={isNextPageLoading}
        items={items}
        loadNextPage={loadNextPage}
      />
    </FullScreen>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
