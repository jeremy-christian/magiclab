import ReactDOM from "react-dom";
import React, { useState } from "react";
import InfiniteList from "./components/InfiniteList";
import { loadOldTweets, loadInitialTweets } from "./api";
import { Tweet } from "./model";

const App = () => {
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [items, setItems] = useState([] as Tweet[]);

  // this callback is called when the infinite loader needs more items
  const loadNextPage = () => {
    setIsNextPageLoading(true);
    // if we already have tweets, load any missing tweets
    if (items.length > 0) {
      return loadOldTweets(items, setItems, setIsNextPageLoading);
    } else {
      // if we have no tweets, load the latest tweets and start looping calls for more
      return loadInitialTweets(setItems, setIsNextPageLoading);
    }
  };

  React.useMemo(() => {
    items.forEach((item, index) => {
      if (index === items.length - 1) {
        return true;
      }
      const idsAreSequential = item.id === items[index + 1].id + 1;
      if (!idsAreSequential) {
        console.log({
          items: items.map((i) => i.id),
          a: item.id,
          b: items[index + 1].id + 1,
        });
        throw Error(`Fetch error: ${"missing / duplicate tweet detected"}`);
      }
    });
  }, [items]);

  return (
    <InfiniteList
      isNextPageLoading={isNextPageLoading}
      items={items}
      loadNextPage={loadNextPage}
    />
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
