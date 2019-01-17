import * as React from 'react';

interface CacheValue<T> {
    value: T;
    when: number;
}

const useRecencyCache = <T>(key: string, defaultValue: T, discardAfterMillis: number): [
    T,
    (newValue: T) => void
] => {
    const [hadRevivedValue, setHadRevivedValue] = React.useState<boolean>(false);

    if (!hadRevivedValue) {
        try {
            const storedSerializedValue = window.localStorage.getItem(key);
            // const storedValue: T | null = 
            //     storedSerializedValue && JSON.parse(storedSerializedValue);

            const cacheEntry: CacheValue<T> | null =
                storedSerializedValue && JSON.parse(storedSerializedValue);

            if (cacheEntry !== null) {
                const now = Date.now();
                const tooLate = (now - discardAfterMillis) > cacheEntry.when;
                
                if (!tooLate) {   
                    defaultValue = cacheEntry.value as NonNullable<T>;
                }
            }
        } finally {
            setHadRevivedValue(true);
        }
    }

    const [state, setState] = React.useState<T>(defaultValue);
    const setStorageState = React.useCallback((newValue: NonNullable<T>) => {
        setState(newValue);

        try {
            // tslint:disable-next-line:triple-equals
            if (newValue == undefined) {
                window.localStorage.removeItem(key);
            } else {
                const toStore = JSON.stringify({
                    value: newValue,
                    when: Date.now(),
                });
                window.localStorage.setItem(key, toStore);
            }
        } catch {
            return;
        }
    }, [key, setState]);

    return [
        state,
        setStorageState
    ]
};

export default useRecencyCache;