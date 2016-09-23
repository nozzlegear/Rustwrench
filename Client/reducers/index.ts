import * as React from "react";
import {combineReducers} from "redux";
import {IDefaultReduxState} from "rustwrench";
import {routerReducer} from "react-router-redux";
import AuthReducer, {State as AuthState} from "./auth";

export interface IReduxState extends IDefaultReduxState {
    auth: AuthState,
}

export default combineReducers({auth: AuthReducer, routing: routerReducer});