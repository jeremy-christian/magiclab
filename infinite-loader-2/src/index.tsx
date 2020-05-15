import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import InfiniteList from "./components/InfiniteList";
import styled from "styled-components";
import _ from "lodash";

const FullScreen = styled.div`
  width: 100%;
  height: 100vh;
`;
//@ts-ignore
const getTweets = (oldestItem, setItems, setIsNextPageLoading) => {
  // console.log("fetching tweets");
  console.log("oldid", oldestItem?.id);
  const apiCall = oldestItem
    ? `https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/api?count=10&beforeId=${oldestItem.id}`
    : "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/api?count=10";

  fetch(apiCall)
    .then((response) => response.json())
    .then(async (tweets) => {
      if (_.find(tweets, { id: 10001 })) {
        // console.log("resetting");
        await fetch(
          "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/reset"
        );
      }
      return tweets;
    })
    .then((tweets) => {
      // console.log("fetched");
      setIsNextPageLoading(false);
      //@ts-ignore
      setItems((oldTweets) => {
        // console.log("this", oldTweets.concat(tweets));
        return oldTweets.concat(tweets);
      });
    })
    .catch(function (error) {
      console.log("error, trying again: \n", error);
      getTweets(oldestItem, setItems, setIsNextPageLoading);
    });
};

//@ts-ignore
const getNewTweets = (newestItem, setItems) => {
  // console.log("fetching tweets");
  console.log("newid", newestItem?.id);
  const apiCall = newestItem
    ? `https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/api?count=10&afterId=${newestItem.id}`
    : "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/api?count=10";
  setTimeout(() => {
    fetch(apiCall)
      .then((response) => response.json())
      .then(async (tweets) => {
        if (_.find(tweets, { id: 10001 })) {
          // console.log("resetting");
          await fetch(
            "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/reset"
          );
        }
        return tweets;
      })
      .then((tweets) => {
        // console.log("fetched");
        //@ts-ignore
        setItems((oldTweets) => {
          // console.log("this", oldTweets.concat(tweets));
          return tweets.concat(oldTweets);
        });
        getNewTweets(tweets[0], setItems);
      })
      .catch(function (error) {
        // console.log("error, trying again: \n", error);
        getNewTweets(newestItem, setItems);
      });
  }, 2000);
};

const App = () => {
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  //@ts-ignore
  const _loadNextPage = (...args) => {
    // console.log("loadNextPage", ...args);
    // console.log("items", items.length);
    setHasNextPage(items.length < 10000);
    setIsNextPageLoading(true);
    getTweets(items[items.length - 1], setItems, setIsNextPageLoading);
  };

  useEffect(() => getNewTweets(items[0], setItems), [setItems]);

  return (
    <FullScreen>
      <InfiniteList
        setStartIndex={setStartIndex}
        hasNextPage={hasNextPage}
        isNextPageLoading={isNextPageLoading}
        items={items}
        loadNextPage={_loadNextPage}
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
