// Import the babel-polyfill at the top of the application
const polyfill = require("babel-polyfill");

// Material-UI needs the react-tap-event-plugin activated
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin(); 

// Fetch shim
require("./node_modules/whatwg-fetch/fetch.js");

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

// Auth components
import AuthPage from "./pages/auth";

// Signup components
import SignupPage from "./pages/signup";
import IntegratePage from "./pages/signup/integrate";
import FinalizeIntegrationPage from "./pages/signup/finalize";

// Home components
import HomePage from "./pages/home";

// Styles
import {MuiThemeProvider} from "material-ui/styles";
require("./node_modules/purecss/build/pure.css");
require("./node_modules/typebase.css/typebase.css");
require("./css/theme.scss");

// Main app component
export default function Main(props) {
    return (
        <MuiThemeProvider>
            <main id="app"> 
                {React.cloneElement(props.children, props)}
                <footer id="footer">
                    <div>
                        <p>
                            {`© ${AppName}, ${new Date().getUTCFullYear()}. All rights reserved.`}
                        </p>
                        <p>
                            {"Powered by "}
                            <a target="_blank" href="https://github.com/nozzlegear/rustwrench">
                                {"Rustwrench"}
                            </a>
                            {"."}
                        </p>
                    </div>
                </footer>
            </main>
        </MuiThemeProvider>
    )
}

export function MinimalMain(props) {
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
        const path = args.location.pathname;
        const state = store.getState() as IReduxState;
        const tokenInvalid = !state.auth || !state.auth.token || (state.auth.exp * 1000 < Date.now()); 

        if (tokenInvalid) {
            replace(Paths.auth.login);
        } else if (!state.auth.shopifyUrl && !getPathRegex(Paths.signup.integrate).test(path) && !getPathRegex(Paths.signup.finalizeIntegration).test(path)) {
            replace(Paths.signup.integrate);
        }

        callback();
    }

    function logout(args: Router.RouterState, replace: Router.RedirectFunction, callback: Function) {
        store.dispatch(AuthActions.removeAuth());
        replace(Paths.auth.login);
        callback();
    }

    function mapStateToProps(state: IReduxState, ownProps) {
        // Must explicitly return a new object, not the state.
        return Object.assign({}, state);
    }

    const App = connect(mapStateToProps)(Main);
    const MinimalApp = connect(mapStateToProps)(MinimalMain);
    const routes = (    
        <Provider store={store}>
            <Router history={history}>
                <Route component={App}>
                    <Route onEnter={checkAuthState} >
                        <Route path={Paths.home.index} component={HomePage} onEnter={args => document.title = AppName} />
                    </Route>
                </Route>
                <Route component={MinimalApp}>
                    <Route path={Paths.auth.login} component={AuthPage} onEnter={(args) => {document.title = "Login"}} />
                    <Route path={Paths.signup.index} component={SignupPage} onEnter={args => document.title = "Signup"} />
                    <Route onEnter={checkAuthState}>
                        <Route path={Paths.signup.integrate} component={IntegratePage} onEnter={args => document.title = "Connect your Shopify store"} />
                        <Route path={Paths.signup.finalizeIntegration} component={FinalizeIntegrationPage} onEnter={args => document.title = "Connecting your Shopify store"} />
                    </Route>
                </Route>
                <Route path={Paths.auth.logout} onEnter={logout} />
                <Route path={"/error/:statusCode"} component={Error} onEnter={(args) => {document.title = `Error ${args.params["statusCode"]} | ${AppName}`}} />
                <Redirect path={"*"} to={"/error/404"} />
            </Router>
        </Provider>
    )

    renderComponent(routes, document.getElementById("contenthost"));
}