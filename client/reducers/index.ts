import * as React from "react";
import {combineReducers} from "redux";
import {IDefaultReduxState} from "rustwrench";
import {routerReducer} from "react-router-redux";
import AuthReducer, {AuthState} from "./auth";
import DashboardReducer, {State as DashboardState} from "./dashboard";
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {MuiTheme} from "material-ui/styles";

export interface IReduxState extends IDefaultReduxState {
    auth: AuthState,
    dashboard: DashboardState,
    theme: MuiTheme,
}

export default combineReducers({
    auth: AuthReducer, 
    dashboard: DashboardReducer, 
    routing: routerReducer,
    theme: (state, action) => {
        if (!state) {
            return getMuiTheme(baseTheme)
        }

        return state;
    }
});