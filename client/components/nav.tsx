import * as React from "react";
import Paths from "../modules/paths";
import {IReduxState} from "../reducers";
import {AppName} from "../modules/strings";
import {navigate} from "../modules/redux_store";
import {
    AppBar, 
    TouchTapEvent,
    Drawer,
    MenuItem,
    Divider,
} from "material-ui";

export interface IProps extends IReduxState {
    rightIconClass?: string;
    onRightIconTouchTap?: (e: TouchTapEvent) => void;
}

export interface IState {
    drawerOpen?: boolean;
}

export default class Nav extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {}
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion

    private onRightIconTouchTap(e: TouchTapEvent) {
        if (this.props.onRightIconTouchTap) {
            this.props.onRightIconTouchTap(e);
        }
    }
    
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
            <div>
                <AppBar title={AppName} onLeftIconButtonTouchTap={e => this.setState({drawerOpen: true})}  iconClassNameRight={props.rightIconClass} onRightIconButtonTouchTap={e => this.onRightIconTouchTap(e)} />
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
            </div>
        )
    }
}