import * as React from "react";
import {Link} from "react-router";
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

        alert ("GOING TO AUTH");

        //navigate(this.props.auth.token ? Paths.auth.logout : Paths.auth.login);
    }

    private goToAccount(e: TouchTapEvent) {
        e.preventDefault();

        alert("HIT");
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
                    <MenuItem 
                        containerElement={<Link to={Paths.home.index} />}
                        primaryText="Dashboard" />
                    <Divider  /> 
                    <MenuItem 
                        containerElement={<Link to={Paths.account.index} />} 
                        primaryText="My Account" />
                    <MenuItem 
                        containerElement={<Link to={props.auth.token ? Paths.auth.logout : Paths.auth.login} />} 
                        primaryText={props.auth.token ? "Sign out" : "Sign in"} />
                </Drawer>
            </div>
        )
    }
}