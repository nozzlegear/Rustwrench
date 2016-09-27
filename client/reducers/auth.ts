import {SessionToken, Action} from "rustwrench";
import {AuthStorageName} from "../modules/strings";

export type AuthActionType = (
    "SET_AUTH" |
    "REMOVE_AUTH"
);

export interface AuthState extends SessionToken { }

export interface AuthAction extends Action<AuthActionType, AuthState> {  }

export interface IActions {
    setAuth: (payload: AuthState) => AuthAction;
    removeAuth: () => AuthAction;
}

export const Actions: IActions = {
    setAuth: (payload) => ({
        type: "SET_AUTH",
        reduce: state => payload  
    }),
    removeAuth: () => ({
        type: "REMOVE_AUTH",
        reduce: state => ({} as any)
    })
}

export default function authReducer(state: AuthState, action: AuthAction) {
    if (!state) {
        state = JSON.parse(localStorage.getItem(AuthStorageName) || "{}");
    }

    switch (action.type) {
        case "SET_AUTH": 
        case "REMOVE_AUTH":
            state = action.reduce(state);
        break;

        default: 
        // This reducer did not run, so return the original state. Doing so will prevent the reducer 
        // from needlessly updating all dependent components.
        return state;
    }

    // Persist the auth changes to localstorage
    localStorage.setItem(AuthStorageName, JSON.stringify(state));

    // Redux reducers must always return a new object, else they won't update their dependent components.
    return Object.assign({}, state);
}