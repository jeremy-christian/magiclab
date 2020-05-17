import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import InfiniteList from "./components/InfiniteList";
import styled from "styled-components";
import _ from "lodash";
import { loadOlderTweets, loadNewTweets, loadInitialTweets } from "./api";
import { Tweet } from "./model";

const FullScreen = styled.div`
  width: 100%;
  height: 100vh;
`;

const App = () => {
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [items, setItems] = useState([] as Tweet[]);

  const loadNextPage = () => {
    setIsNextPageLoading(true);
    if (items.length > 0) {
      loadOlderTweets(items, setItems, setIsNextPageLoading);
    } else {
      loadInitialTweets(setItems, setIsNextPageLoading);
    }
  };

  return (
    <FullScreen>
      <InfiniteList
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
