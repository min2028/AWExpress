import { useMemo } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';
import thunkMiddleware from 'redux-thunk';
import {createMigrate, persistReducer, persistStore} from 'redux-persist';
import {createWrapper} from "next-redux-wrapper";
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers';



let store

const migrations = {
    0: (state) => {
        return {
            ...state,
            auth: {
                user: null,
            }
        }
    },
    1: (state) => {
        return {
            ...state,
            auth: {
                user: null,
            },
            amounts: {
                cartItems: 0,
                orderItems: 0,
                listingItems: 0,
                pendingItems: 0,
            }
        }
    },
    2: (state) => {
        return {
            ...state,
            auth: {
                user: null,
            },
            amounts: {
                cartItems: 0,
                cartUpdateListener: false,
                orderItems: 0,
                listingItems: 0,
                pendingItems: 0,
            }
        }
    }
}

const persistConfig = {
    key: 'root',
    version: 0,
    storage,
    migrate: createMigrate(migrations, {debug: true})
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

function makeStore(initialState) {
    return createStore(
        persistedReducer,
        initialState,
        composeWithDevTools(applyMiddleware(thunkMiddleware))
    );
}

export const initializeStore = (preloadedState) => {
    let _store = store ?? makeStore(preloadedState);

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
        _store = makeStore({
            ...store.getState(),
            ...preloadedState,
        })
        // Reset the current store
        store = undefined;
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store;
    // Create the store once in the client
    if (!store) store = _store;

    return _store;
}

export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState]);
    return store;
}