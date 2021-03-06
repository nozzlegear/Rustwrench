import rootReducer from "../reducers";
import {browserHistory} from "react-router";
import {createStore, applyMiddleware} from "redux";
import {syncHistoryWithStore, routerMiddleware, push, replace} from "react-router-redux";
    
const middleware = routerMiddleware(browserHistory);

export const store = createStore(rootReducer, applyMiddleware(middleware));
export const history = syncHistoryWithStore(browserHistory, store);

/**
 * Dispatches a redux navigation action to navigate to the given path.
 */
export function navigate(path: string) {
    return store.dispatch(push(path));
}

/**
 * Dispatches a redux replace action, replacing the current page with another.
 */
export function replacePath(path: string) {
    return store.dispatch(replace(path));
}