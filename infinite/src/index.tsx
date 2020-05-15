import React, { useState, useEffect, useCallback } from "react";
import { Tweet } from "./model";
import { render } from "react-dom";
import "antd/dist/antd.css";
import { VirtualList } from "./components";
import _ from "lodash";

const getTweets = (setTweets: (tweets: Tweet[]) => void, loadMore: boolean) => {
  console.log("fetching");
  setTimeout(() => {
    console.log("loadmore", loadMore);
    if (loadMore) {
      fetch(
        "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/api?count=100"
      )
        .then((response) => response.json())
        .then(async (tweets) => {
          if (_.find(tweets, { id: 10001 })) {
            console.log("reseting");
            await fetch(
              "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/reset"
            );
          }
          return tweets;
        })
        .then((tweets) => {
          setTweets(tweets);
        })
        .catch(function (error) {
          console.log("error: \n", error);
        });
      getTweets(setTweets, loadMore);
    }
    console.log("recursive loadmore", loadMore);
  }, 5000);
};

const App = () => {
  const [tweets, setTweets] = useState([]);
  const [loadMore, setLoadMore] = useState(true);
  console.log("setting loadmore", loadMore, { tweets: tweets.length });

  const onItemsRendered = useCallback(
    ({ visibleStartIndex }) => {
      console.log("in items rendered", visibleStartIndex);
      if (visibleStartIndex === 0) {
        setLoadMore(true);
      } else {
        setLoadMore(false);
      }
    },
    [setLoadMore]
  );

  useEffect(() => getTweets(setTweets, loadMore), [loadMore]);

  return <VirtualList tweets={tweets} onItemsRendered={onItemsRendered} />;
};

render(<App />, document.getElementById("root"));
