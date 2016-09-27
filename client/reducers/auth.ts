import {SessionToken, Action} from "rustwrench";
import {AuthStorageName} from "../modules/strings";

export type AuthActionType = (
    "LOGIN" |
    "LOGOUT"
);

export interface AuthState {
    rustwrench_token: string;
    rustwrench_token_payload: SessionToken;
}

export interface AuthAction extends Action<AuthActionType, AuthState> {  }

export interface IActions {
    login: (payload: AuthState) => AuthAction;
    logout: () => AuthAction;
}

export const Actions: IActions = {
    login: (payload) => ({
        type: "LOGIN",
        reduce: state => payload  
    }),
    logout: () => ({
        type: "LOGOUT",
        reduce: state => ({} as any)
    })
}

export default function authReducer(state: AuthState, action: AuthAction) {
    if (!state) {
        state = JSON.parse(localStorage.getItem(AuthStorageName) || "{}");
    }

    switch (action.type) {
        case "LOGIN": 
        case "LOGOUT":
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