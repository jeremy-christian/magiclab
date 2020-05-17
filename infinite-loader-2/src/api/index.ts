import { Tweet } from "../model";
import {
  find as loFind,
  differenceBy as loDifferenceBy,
  findIndex as loFindIndex,
} from "lodash";
import { stringify } from "querystring";

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
  startIndex: number,
  stopIndex: number,
  items: Tweet[],
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  let missingIds = {} as Record<string, Array<number>>;
  for (let i = startIndex; i < stopIndex; i += 1) {
    const { id, loading } = items[i];
    if (id && loading) {
      const batchID = String(Math.floor(id / 50));
      if (missingIds[batchID]) missingIds[batchID].push(id);
      else missingIds[batchID] = [id];
    }
  }

  if (Object.keys(missingIds).length > 0) {
    return Promise.all(
      Object.keys(missingIds).map((key) => {
        const fetchRequest = `${apiURL}api?count=10&afterId=${missingIds[key][0]}`;
        return fetch(fetchRequest)
          .then((response) => response.json())
          .then(checkForReset)
          .then((missingTweets) => {
            // if successful, update state
            setIsNextPageLoading(false);
            setItems((currentTweets: Tweet[]) => {
              const newTweets = [...currentTweets];
              missingTweets.forEach((tweet) => {
                const index = loFindIndex(currentTweets, { id: tweet.id });
                newTweets[index] = tweet;
              });
              return newTweets;
            });
          })
          .catch((error) => {
            // if unsuccessful, try again with the same id
            loadMissingTweets(
              startIndex,
              stopIndex,
              items,
              setItems,
              setIsNextPageLoading
            );
          });
      })
    );
  } else {
    // old tweets are always appended to the bottom of the items arr, so take the last id as oldest
    const oldestId = items[items.length - 1].id;
    const fetchRequest = `${apiURL}api?count=10&beforeId=${oldestId}`;

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
        loadMissingTweets(
          startIndex,
          stopIndex,
          items,
          setItems,
          setIsNextPageLoading
        );
      });
  }
};

export const loadInitialTweets = (
  setItems: Function,
  setIsNextPageLoading: Function
) => {
  const fetchRequest = `${apiURL}api?count=10`;

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
  const fetchRequest = `${apiURL}api?count=3`;

  return fetch(fetchRequest)
    .then((response) => response.json())
    .then(checkForReset)
    .then((newerTweets) => {
      // if successful, update
      setItems((olderTweets: Tweet[]) => {
        // create placeholder entries in items for missing tweets
        const topEdge = newerTweets[newerTweets.length - 1].id;
        const bottomEdge = olderTweets[0].id;
        const idGap = topEdge - bottomEdge;
        const missingTweets =
          idGap < 0
            ? []
            : Array.from(Array(idGap), (_, index) =>
                getDummyTweet(bottomEdge + index)
              );

        // remove duplicate tweets
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
