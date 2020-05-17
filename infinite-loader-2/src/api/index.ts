import { Tweet } from "../model";
import {
  find as loFind,
  differenceBy as loDifferenceBy,
  findIndex as loFindIndex,
} from "lodash";

const apiURL =
  "https://magiclab-twitter-interview.herokuapp.com/jeremy-christian/";

const getDummyTweet = (id: number) => ({
  image: "missing",
  id: id,
  text: "missing",
  username: "missing",
  timeStamp: 0,
  loading: true,
});

// if we encounter a tweet with the id limit, reset the server
const checkForReset = async (tweets: Tweet[]) => {
  // employ lodash to check for limiting id
  if (loFind(tweets, { id: 10001 })) {
    // fire reset request
    await fetch(`${apiURL}reset`);
  }
  return tweets;
};

export const loadMissingTweets = (
  missingTweets: Tweet[],
  setItems: Function
) => {
  // look for tweets after the most recent missing tweet you found
  const fetchRequest = `${apiURL}api?count=50&id=${missingTweets[0].id}&direction=-1`;
  return fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((foundTweets) => {
      // if successful, update state
      setItems((currentTweets: Tweet[]) => {
        const newTweets = [...currentTweets];
        // find the placeholder tweets by id and replace them with the real ones
        foundTweets.forEach((tweet) => {
          const index = loFindIndex(currentTweets, { id: tweet.id });
          newTweets[index] = tweet;
        });
        return newTweets;
      });
      // if you've hit the api count limit, loop again
      if (missingTweets.length > 50) {
        console.log("looping");
        loadMissingTweets(
          [foundTweets[foundTweets.length - 1]].concat(missingTweets.slice(50)),
          setItems
        );
      }
    })
    .catch((error) => {
      // if unsuccessful, try again with the same id
      loadMissingTweets(missingTweets, setItems);
    });
};

export const loadOldTweets = (
  items: Tweet[],
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  // old tweets are always appended to the bottom of the items arr, so take the last id as oldest
  const oldestId = items[items.length - 1].id;
  const fetchRequest = `${apiURL}api?count=50&beforeId=${oldestId}`;

  return fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((olderTweets) => {
      // if successful, update state
      setIsNextPageLoading(false);
      setItems((newerTweets: Tweet[]) => {
        return newerTweets.concat(olderTweets);
      });
    })
    .catch((error) => {
      // if unsuccessful, try again with the same id
      loadOldTweets(items, setItems, setIsNextPageLoading);
    });
};

export const loadInitialTweets = (
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  const fetchRequest = `${apiURL}api?count=50`;

  return fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((tweets) => {
      // if successful, update state
      setIsNextPageLoading(false);
      setItems(tweets);
      // start loading newer tweets
      loadNewTweets(setItems);
    })
    .catch(function (error) {
      // if unsuccessful, try again
      loadInitialTweets(setItems, setIsNextPageLoading);
    });
};

export const loadNewTweets = (setItems: Function) => {
  // if no id provided, return latests tweets
  const fetchRequest = `${apiURL}api?count=50`;

  return fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((newerTweets) => {
      // if successful, update
      setItems((olderTweets: Tweet[]) => {
        // begin check for missing tweets
        // take the id of your last tweet you just received
        const topEdge = newerTweets[newerTweets.length - 1].id;

        // take the id of your most recent tweet
        const bottomEdge = olderTweets[0].id;

        // the missing tweets are the gap between them
        const idGap = topEdge - bottomEdge;

        // make an array of dummy tweet objects to complete the list
        const missingTweets =
          idGap < 0
            ? []
            : Array.from(Array(idGap - 1), (_, index) =>
                getDummyTweet(topEdge - (index + 1))
              );

        // forward the missing tweets to a new fetch call to fill them in over time
        if (missingTweets.length > 0)
          setTimeout(
            () =>
              loadMissingTweets(
                [newerTweets[newerTweets.length - 1]].concat(missingTweets),
                setItems
              ),
            1000
          );

        // remove duplicate tweets from incoming payload
        const cleanNewerTweets = loDifferenceBy(newerTweets, olderTweets, "id");
        return cleanNewerTweets.concat(missingTweets).concat(olderTweets);
      });
      // pause for 2 seconds, then loop using the latest id you retrieved
      setTimeout(() => loadNewTweets(setItems), 2000);
    })
    .catch(function (error) {
      // if we fail, try again with the same id
      setTimeout(() => loadNewTweets(setItems), 2000);
    });
};
