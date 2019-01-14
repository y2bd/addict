import * as React from "react";
import "./App.css";
import Post from "./components/Post";
import useCursor from "./hooks/useCursor";
import { ListingCursor, Sort } from "./reddit/listing";
import { list } from "./server/listingProxy";

const defaultSubreddit = "frugalmalefashion";
const sort: Sort = "hot";

const App = () => {
  const [subInput, setSubInput] = React.useState(defaultSubreddit);
  const [subreddit, setSubreddit] = React.useState(defaultSubreddit);

  const [posts, loadNextPosts, isLoading] = useCursor(
    () =>
      list({
        sort,
        subreddit
      }).then(result => new Promise<ListingCursor>(resolve => {
        setTimeout(() => resolve(result), 1000);
      })),
    {
      additive: true
    },
    [sort, subreddit]
  );

  const loadNext = React.useCallback(
    (evt: React.MouseEvent) => {
      loadNextPosts();

      evt.stopPropagation();
      evt.preventDefault();
    },
    [loadNextPosts]
  );

  const subref = React.useRef(null);

  const onSubInputChange = React.useCallback(
    () => {
      setSubInput((subref.current as any).innerText)
    },
    [subref, setSubInput]
  );

  const onSubInputConfirm = React.useCallback(
    (evt: React.KeyboardEvent<HTMLDivElement>) => {
      if (evt.key === "Enter") {
        setSubreddit(subInput);
      }
    },
    [subInput, setSubreddit]
  );

  return (
    <div className="App">
      <p className="Header">
        <span>/r/</span>
        <div className="Subreddit"
          contentEditable={true}
          defaultValue={subInput}
          ref={subref}
          onInput={onSubInputChange}
          onKeyDown={onSubInputConfirm}>{defaultSubreddit}</div>
        <span> • {sort}</span>
      </p>
      {posts.map(post => (
        <Post {...post} />
      ))}
      {isLoading ? (
        <a href="#" className="loading">
          loading...
        </a>
      ) : (
        <a href="#nextPosts" className="next" onClick={loadNext}>
          next
        </a>
      )}
      <div className={"Loader " + ((isLoading && posts.length <= 0) ? "" : "hidden")}>
        <p>loading posts...</p>
      </div>
    </div>
  );
};

export default App;
