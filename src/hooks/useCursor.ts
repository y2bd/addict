import * as React from "react";
import PromiseCursor, { PromiseCursorProvider } from "../cursor";
import useRecencyCache from './useRecencyCache';

export interface CursorOptions<T> {
  /**
   * Should data from additional requests
   * be appended to the current view,
   * rather than replacing the current view.
   *
   * False by default.
   */
  readonly additive?: boolean;

  readonly onNewCursor?: (cursor: PromiseCursor<T>) => void;
}

export default function useCursor<T>(
  cursorProvider: PromiseCursorProvider<T>,
  options?: CursorOptions<T>,
  inputs: ReadonlyArray<any> = [],
): [T[], () => void, boolean] {
  const [currentCursor, setCurrentCursor] = React.useState<
    PromiseCursor<T> | undefined
  >(undefined);

  const [currentData, setCurrentData] = useRecencyCache<T[]>("currentData", [], 1000 * 60 * 30);
  const [loading, setLoading] = React.useState<boolean>(true);

  const consumeCursor = (provider: PromiseCursorProvider<T>, disableAdditive = false) => {
    setLoading(true);

    provider().then(cursor => {
      setLoading(false);
      setCurrentCursor(cursor);
      if (options && options.onNewCursor) {
        options.onNewCursor(cursor);
      }

      if (options && options.additive && !disableAdditive) {
        setCurrentData(currentData.concat(cursor.data));
      } else {
        setCurrentData(cursor.data);
      }
    });
  };

  const next = React.useCallback(
    () => currentCursor && consumeCursor(currentCursor.next),
    [currentCursor, currentData]
  );

  const runOnce = React.useRef(false);
  React.useEffect(() => {
    if (runOnce.current) {
      setCurrentData([]);
      setLoading(true);
      consumeCursor(cursorProvider, true)
    } else {
      if (currentData.length <= 0) {
        consumeCursor(cursorProvider, false)
      } else {
        setLoading(false);
        setCurrentCursor({
          after: "",
          data: [],
          next: cursorProvider,
        });
      }
      runOnce.current = true;
    }
  }, inputs);

  return [currentData, next, loading];
}
