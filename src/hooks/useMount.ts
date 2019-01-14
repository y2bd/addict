import * as React from "react";

export default function useMount(
  mount: () => void, 
  unmount?: () => void) {
  return React.useEffect(() => {
    mount();
    return unmount;
  }, []);
}
