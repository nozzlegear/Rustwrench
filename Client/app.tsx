// Import the babel-polyfill at the top of the application
const polyfill = require("babel-polyfill");

// Material-UI needs the react-tap-event-plugin activated
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin(); 

// General imports
import * as React from "react";
import {bindActionCreators} from "redux";
import {AppName} from "./modules/strings";
import {Provider, connect} from "react-redux";
import {render as renderComponent} from "react-dom";
import Paths, {getPathRegex} from "./modules/paths";
import {store, history} from "./modules/redux_store";
import {Router, Route, IndexRoute, Redirect, IndexRedirect, Link} from "react-router";

// Actions and reducers
import {IReduxState} from "./reducers";
import {Actions as AuthActions} from "./reducers/auth";

// Layout components
import Error from "./pages/error";
import Navbar from "./components/nav";
import Footer from "./components/footer";

// Auth components
import AuthPage from "./pages/auth";

// Signup components
import SignupPage from "./pages/signup";

// Styles
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require("./node_modules/purecss/build/pure.css");
require("./css/theme.scss");

export default function MainWithNav(props: IReduxState & React.Props<any>) { 
    return (
        <MuiThemeProvider>
            <main id="app"> 
                <Navbar {...props} children={undefined} />
                <div id="body">
                    {React.cloneElement(props.children as any, props)}
                </div>
                <Footer />
            </main>
        </MuiThemeProvider>
    )
}

export function MainWithoutNav(props: IReduxState & React.Props<any>) {
    return (
        <MuiThemeProvider>
            <main id="app" className="minimal"> 
                <div id="body">
                    <div className="page-header">
                        <Link to={Paths.home.index}>{AppName}</Link>
                    </div>
                    {React.cloneElement(props.children as any, props)}
                </div>
            </main>
        </MuiThemeProvider>
    )
}

{
    function checkAuthState(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function) {
        const state = store.getState() as IReduxState;
        const tokenInvalid = !state.auth || !state.auth.token || (state.auth.exp * 1000 < Date.now()); 

        if (tokenInvalid) {
            console.log("User's auth token is invalid.");

            replace(Paths.auth.login);
        }

        callback();
    }

    function logout(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function) {
        store.dispatch(AuthActions.logout());
        replace(Paths.auth.login);
        callback();
    }

    function mapStateToProps(state: IReduxState, ownProps) {
        // Must explicitly return a new object, not the state.
        return Object.assign({}, state);
    }

    const AppWithNav = connect(mapStateToProps)(MainWithNav);
    const AppWithoutNav = connect(mapStateToProps)(MainWithoutNav);
    const routes = (    
        <Provider store={store}>
            <Router history={history}>
                <Route component={AppWithNav}>
                    <Route onEnter={checkAuthState} component={AppWithNav} onChange={(prevState, nextState, replace, callback) => {console.log("AuthState router triggered onChange event."); callback()}} >
                        <Route path={Paths.home.index} />
                    </Route>
                </Route>
                <Route component={AppWithoutNav}>
                    <Route path={Paths.auth.login} component={AuthPage} onEnter={(args) => {document.title = "Login"}} />
                    <Route path={Paths.signup.index} component={SignupPage} onEnter={args => document.title = "Signup"} />
                </Route>
                <Route path={Paths.auth.logout} onEnter={logout} />
                <Route path={"/error/:statusCode"} component={Error} onEnter={(args) => {document.title = `Error ${args.params["statusCode"]} | KMSignalR`}} />
                <Redirect path={"*"} to={"/error/404"} />
            </Router>
        </Provider>
    )

    renderComponent(routes, document.getElementById("contenthost"));
}