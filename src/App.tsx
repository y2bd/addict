import * as React from "react";
import "./App.css";
import Post from "./components/Post";
import useRecencyCache from './hooks/useRecencyCache';
import useSubredditPosts from './hooks/useSubredditPosts';
import { Sort } from "./reddit/listing";

const defaultSubreddit = "frugalmalefashion";
const sort: Sort = "hot";

const App = () => {
  const [subreddit, setSubreddit] = 
    useRecencyCache("subreddit", defaultSubreddit, 1000 * 60 * 60 * 24 * 30);
  const [subInput, setSubInput] = React.useState(subreddit);

  const [subredditOnce] = React.useState(subInput);

  const [posts, loadNextPosts, isLoading] = useSubredditPosts(sort, subreddit);

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
          onKeyDown={onSubInputConfirm}>{subredditOnce}</div>
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
