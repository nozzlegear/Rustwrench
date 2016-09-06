// Import the babel-polyfill at the top of the application
const polyfill = require("babel-polyfill");

import * as React from "react";
import {ReduxProps} from "rustwrench";
import {bindActionCreators} from "redux";
import {Provider, connect} from "react-redux";
import {render as renderComponent} from "react-dom";
import Paths, {getPathRegex} from "../modules/paths";
import {store, history} from "../modules/redux_store";
import {Router, Route, IndexRoute, Redirect, IndexRedirect, Link} from "react-router";

// Actions
import authActions from "../actions/auth";

// Layout components
import Navbar from "../components/nav";
import Footer from "../components/footer";
import Error from "./error/error";

// Auth components
import AuthMain from "./auth/main";
import Login from "./auth/login";

// Home components
import Home from "./home/home";

// Styles
require("../css/overrides.scss");
require("../css/theme.scss");

export default function Main(props: ReduxProps)
{   
    return (
        <main id="app"> 
            <Navbar {...props} children={undefined} />
            {React.cloneElement(props.children as any, props)}
            <Footer />
        </main>
    )
}

{
    function checkAuthState(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function)
    {
        const state = store.getState() as ReduxProps;
        const tokenInvalid = !state.auth || !state.auth.token || (state.auth.exp * 1000 < Date.now()); 

        if (tokenInvalid)
        {
            console.log("User's auth token is invalid.");

            replace(Paths.auth.login);
        }

        callback();
    }

    function logout(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function)
    {
        store.dispatch(authActions.logout());
        replace(Paths.auth.login);
        callback();
    }

    function mapStateToProps(state: ReduxProps, ownProps) {
        // Must explicitly return a new object, not the state.
        const output: ReduxProps = {
            portrait: state.portrait,
            cart: state.cart,
            auth: state.auth,
        }
        
        return output;
    }

    const App = connect(mapStateToProps)(Main);
    const Auth = connect(mapStateToProps, dispatch => bindActionCreators(authActions as any, dispatch))(AuthMain);

    const routes = (
        <Provider store={store}>
            <Router history={history}>
                <Route path={Paths.auth.login} component={Auth} />
                <Route path={Paths.auth.logout} onEnter={logout} />
                <Route onEnter={checkAuthState} onChange={(prevState, nextState, replace, callback) => {console.log("AuthState router triggered onChange event."); callback()}} >
                    <Route path={Paths.home.index} component={App}>
                        <IndexRoute component={Home} />
                    </Route>
                </Route>
                <Route path={"/error/:statusCode"} component={Error} />
                <Redirect path={"*"} to={"/error/404"} />
            </Router>
        </Provider>
    )

    renderComponent(routes, document.getElementById("contenthost"));
}