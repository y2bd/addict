import * as React from "react";
import PromiseCursor, { PromiseCursorProvider } from "../cursor";

export interface CursorOptions {
  /**
   * Should data from additional requests
   * be appended to the current view,
   * rather than replacing the current view.
   *
   * False by default.
   */
  readonly additive?: boolean;
}

export default function useCursor<T>(
  cursorProvider: PromiseCursorProvider<T>,
  options?: CursorOptions,
  inputs: ReadonlyArray<any> = [],
): [T[], () => void, boolean] {
  const [currentCursor, setCurrentCursor] = React.useState<
    PromiseCursor<T> | undefined
  >(undefined);

  const [currentData, setCurrentData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const consumeCursor = (provider: PromiseCursorProvider<T>, disableAdditive = false) => {
    setLoading(true);

    provider().then(cursor => {
      setLoading(false);
      setCurrentCursor(cursor);

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

  React.useEffect(() => {
    setCurrentData([]);
    setLoading(true);
    consumeCursor(cursorProvider, true)
  }, inputs);

  return [currentData, next, loading];
}
