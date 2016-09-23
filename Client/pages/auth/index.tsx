import * as React from 'react';
import * as Reqwest from "reqwest";
import * as Bluebird from "bluebird";
import Box from "../../components/box";
import {SessionToken} from "rustwrench";
import Paths from "./../../modules/paths"
import {AppName} from "../../modules/strings";
import {IActions} from "./../../reducers/auth";
import getApiError from "./../../modules/errors";
import {navigate} from "./../../modules/redux_store";
import {AutoPropComponent} from "auto-prop-component";
import {TextField, RaisedButton, FontIcon} from "material-ui";
import {RouterState, RedirectFunction, Link} from "react-router";

export interface IProps extends IActions
{
    
}

export interface IState
{
    error?: string;

    loading?: boolean;

    username?: string;

    password?: string;
}

export default class AuthPage extends AutoPropComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};

    private pageContainer: Element;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = { 
            username: "",
            password: "",
        };
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion

    //#region Event listeners

    private async handleSignIn(e: React.MouseEvent<any> | React.FormEvent<any>) {
        e.preventDefault();

        if (this.state.loading) {
            return;
        }

        const {username, password} = this.state;

        if (!username) {
            this.mergeState({error: "You must enter your username."});

            return;
        }

        if (!password) {
            this.mergeState({error: "You must enter your password."});

            return;
        }

        this.mergeState({loading: true, error: undefined});
        
        const req = Reqwest<SessionToken>({
            url: "/api/v1/sessions",
            data: JSON.stringify({username, password}),
            contentType: "application/json",
            headers: {"Content-Type": "application/json"},
            method: "POST",
        });

        try {
            const result = await Bluebird.resolve(req);

            console.log("Got result", result);

            this.props.login(result);

            this.mergeState({loading: false}, () => {
                navigate(Paths.home.index);
            })
        }
        catch (e) {
            const result = getApiError(e, "Something went wrong while trying to sign you in. Please try again.");

            this.mergeState({error: result.message, loading: false});

            return;
        }
    }

    //#endregion

    public static willTransitionTo(router: RouterState, replace: RedirectFunction) {
        
    }
    
    public componentDidMount() {
        
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        const {error, loading, username, password} = this.state;
        const footer = <RaisedButton onTouchTap={e => this.handleSignIn(e)} primary={true} fullWidth={true} label={loading ? "Signing in" : "Sign in"} icon={loading ? <FontIcon className="fa fa-spinner fa-spin" /> : null} />;

        return (
            <section id="login">
                <div className="pure-g center-children">
                    <div className="pure-u-12-24">
                        <Box title="Sign in to your account." error={error} footer={footer}>
                            <div className="form-group">
                                <TextField fullWidth={true} floatingLabelText="Email" value={username} onChange={this.updateStateFromEvent((s, v) => s.username = v)} />
                            </div>
                            <div className="form-group">
                                <TextField fullWidth={true} floatingLabelText="Password" type="password" onChange={this.updateStateFromEvent((s, v) => s.password = v)} />
                            </div>
                        </Box>
                        <div className="info-line">
                            <Link to={Paths.signup.index}>{"Don't have an account? Click here to create one."}</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}