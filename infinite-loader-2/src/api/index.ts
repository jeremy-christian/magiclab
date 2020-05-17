import { Tweet } from "../model";
import { find as loFind } from "lodash";

const apiURL =
  "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/";

// if we encounter a tweet with the id limit, reset the server
const checkForReset = async (tweets: Tweet[]) => {
  // employ lodash to check for limiting id
  if (loFind(tweets, { id: 10001 })) {
    // fire reset request
    await fetch(`${apiURL}reset`);
  }
  return tweets;
};

export const loadOlderTweets = (
  items: Tweet[],
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  const oldestId = items[items.length - 1].id;
  const fetchRequest = `${apiURL}api?count=10&beforeId=${oldestId}`;
  console.log("old");
  fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((tweets) => {
      // if successful, update state
      setIsNextPageLoading(false);
      setItems((oldTweets: Tweet[]) => {
        return oldTweets.concat(tweets);
      });
    })
    .catch(function (error) {
      // if unsuccessful, try again with the same id
      loadOlderTweets(items, setItems, setIsNextPageLoading);
    });
};

export const loadInitialTweets = (
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  const fetchRequest = `${apiURL}api?count=10`;

  fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((tweets) => {
      // if successful, update state
      setIsNextPageLoading(false);
      setItems(tweets);
      // start loading newer tweets
      loadNewTweets(tweets[0].id, setItems);
    })
    .catch(function (error) {
      // if unsuccessful, try again
      loadInitialTweets(setItems, setIsNextPageLoading);
    });
};

export const loadNewTweets = (
  newestID: number | undefined,
  setItems: Function
) => {
  // if no id provided, return latests tweets
  const fetchRequest = newestID
    ? `${apiURL}api?count=10&afterId=${newestID}`
    : `${apiURL}api?count=10`;

  fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((tweets) => {
      // if successful, update
      setItems((oldTweets: Tweet[]) => tweets.concat(oldTweets));
      // pause for 2 seconds, then loop
      setTimeout(() => loadNewTweets(tweets[0]?.id, setItems), 2000);
    })
    .catch(function (error) {
      // if we fail, try again with the same id
      setTimeout(() => loadNewTweets(newestID, setItems), 2000);
    });
};
