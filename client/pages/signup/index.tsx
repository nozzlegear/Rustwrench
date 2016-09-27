import * as React from 'react';
import {Link} from "react-router";
import Box from "../../components/box";
import {SessionToken} from "rustwrench";
import Paths from "../../modules/paths";
import {IReduxState} from "../../reducers";
import {AppName} from "../../modules/strings";
import {ApiResult, Users} from "../../modules/api";
import {Actions, AuthState} from "../../reducers/auth";
import {AutoPropComponent} from "auto-prop-component";
import {store, navigate} from "../../modules/redux_store";
import {TextField, RaisedButton, FontIcon} from "material-ui";

export interface IProps extends IReduxState {
    
}

export interface IState {
    username?: string;
    password?: string;
    loading?: boolean;
    error?: string;
}

export default class SignupPage extends AutoPropComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};

    private usersApi = new Users();
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {
            password: "",
            username: "",
        }
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion

    private async createAccount(e: React.MouseEvent<any> | React.FormEvent<any>) {
        e.preventDefault();

        if (this.state.loading) {
            return;
        }

        this.setState({loading: true, error: undefined});
        let token: AuthState;

        try {
            const result = await this.usersApi.create({
                username: this.state.username,
                password: this.state.password,
            });

            if (!result.ok) {
                this.setState({loading: false, error: result.error.message});

                console.log("Hit");

                return;
            }

            token = result.data;
        }
        catch (e) {
            this.setState({loading: false, error: "Something went wrong and we could not create your account."});

            console.log("Hit 2", e);

            return;
        }

        store.dispatch(Actions.login(token));
        navigate(Paths.signup.integrate);
    }
    
    public componentDidMount() {
        
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        const {username, password, loading, error} = this.state;
        const actions = (
            <RaisedButton 
                fullWidth={true} 
                primary={true}
                onTouchTap={e => this.createAccount(e)}
                label={loading ? "Starting Account" : "Start Account"} 
                icon={loading ? <FontIcon className="fa fa-spinner fa-spin" /> : null} />);

        return (
            <section id="signup">
                <div className="pure-g center-children">
                    <div className="pure-u-12-24">
                        <Box title={`Start your ${AppName} account.`} footer={actions} error={error}>
                            <div className="form-group">
                                <TextField 
                                    fullWidth={true} 
                                    floatingLabelText="Email" 
                                    value={username}
                                    type="email" 
                                    hintText="john.doe@example.com" 
                                    onChange={this.updateStateFromEvent((s, v) => s.username = v)} />
                            </div>
                            <div className="form-group">
                                <TextField 
                                    fullWidth={true} 
                                    floatingLabelText="Password" 
                                    value={password} 
                                    type="password" 
                                    onChange={this.updateStateFromEvent((s, v) => s.password = v)} />
                            </div>
                        </Box>
                        <div className="info-line">
                            <Link to={Paths.auth.login}>{"Already have an account? Click here to log in."}</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}