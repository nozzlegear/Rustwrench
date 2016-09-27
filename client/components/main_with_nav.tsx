import * as React from 'react';
import {Link} from "react-router";
import Paths from "../modules/paths";
import {IReduxState} from "../reducers";
import {AppName} from "../modules/strings";
import {navigate} from "../modules/redux_store";
import {MuiThemeProvider} from "material-ui/styles";
import {Drawer, Menu, MenuItem, AppBar, TouchTapEvent, Divider} from "material-ui";

export interface IProps extends IReduxState {

}

export interface IState {
    drawerOpen?: boolean;
}

export default class MainWithNav extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {
            drawerOpen: false
        }
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion
    
    private goToAuth(e: TouchTapEvent) {
        e.preventDefault();

        navigate(this.props.auth.token ? Paths.auth.logout : Paths.auth.login);
    }

    public componentDidMount() {
        
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        const props = this.props;

        return (
            <MuiThemeProvider>
                <main id="app"> 
                    <AppBar onLeftIconButtonTouchTap={e => this.setState({drawerOpen: true})} title={AppName} />
                    <div id="body">
                        {React.cloneElement(props.children as any, props)}
                    </div>
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
                    <Drawer open={this.state.drawerOpen} docked={false} disableSwipeToOpen={true} onRequestChange={open => this.setState({drawerOpen: open})}>
                        <AppBar onLeftIconButtonTouchTap={e => this.setState({drawerOpen: false})} title={AppName} />
                        <MenuItem>
                            {"Hello, world!"}
                        </MenuItem>
                        <Divider  /> 
                        <MenuItem href={props.auth.token ? Paths.auth.logout : Paths.auth.login} onTouchTap={e => this.goToAuth(e)}>
                            {props.auth.token ? "Sign out" : "Sign in"}
                        </MenuItem>
                    </Drawer>
                </main>
            </MuiThemeProvider>
        );
    }
}