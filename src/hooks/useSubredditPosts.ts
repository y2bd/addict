import React = require('react');
import { ListingCursor, ListingData, Sort } from '../reddit/listing';
import { list } from '../server/listingProxy';
import useCursor from './useCursor';
import useRecencyCache from './useRecencyCache';

export default function useSubredditPosts(
    sort: Sort,
    subreddit: string,
): [ListingData[], () => void, boolean] {
    const [after, setAfter] = useRecencyCache<string>("after", "", 1000 * 60 * 30);

    const runOnce = React.useRef(false);
    React.useEffect(() => {
        if (runOnce.current) {
            setAfter("");
        }

        runOnce.current = true;
    }, [sort, subreddit]);



    return useCursor(
        () =>
          list({
            after: after || undefined,
            sort,
            subreddit,
          }).then(result => new Promise<ListingCursor>(resolve => {
            setAfter(after);
            setTimeout(() => resolve(result), 500);
          })),
        {
          additive: true,
          onNewCursor: (cursor) => setAfter(cursor.after),
        },
        [sort, subreddit]
      );
}