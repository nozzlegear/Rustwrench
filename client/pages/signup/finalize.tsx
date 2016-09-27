import {parse} from "qs";
import * as React from 'react';
import Box from "../../components/box";
import {Paths} from "../../modules/paths";
import {Shopify} from "../../modules/api";
import {IReduxState} from "../../reducers";
import {Actions} from "../../reducers/auth";
import {blueGrey700} from "material-ui/styles/colors";
import {AutoPropComponent} from "auto-prop-component";
import {store, navigate} from "../../modules/redux_store";
import {CircularProgress, RaisedButton, FontIcon} from "material-ui";

export interface IProps extends IReduxState {
    
}

export interface IState {
    error?: string;
}

export default class FinalizePage extends AutoPropComponent<IProps, IState> {
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

    public async componentDidMount() {
        const qs = parse(window.location.search.replace(/^\?/i, "")) as {code: string, shop: string};
        const api = new Shopify(this.props.auth.token);
        
        try {
            const req = await api.authorize({code: qs.code, shopUrl: qs.shop, fullQueryString: window.location.search});

            if (!req.ok) {
                this.setState({error: req.error.message});

                return;
            }

            store.dispatch(Actions.setAuth(req.data));
            navigate(Paths.home.index);
        } catch (e) {
            console.error(e);
            this.setState({error: "Something went wrong and we could not integrate your Shopify store."});
        }
    }

    private tryAgain(e: React.FormEvent<any> | React.MouseEvent<any>) {
        e.preventDefault();

        navigate(Paths.signup.integrate);
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        const {error} = this.state;
        const padding = "50px";
        let action: JSX.Element;

        if (error) {
            action = <RaisedButton primary={true} fullWidth={true} label="Try again" onTouchTap={(e) => this.tryAgain(e)} />;
        }

        return (
            <section id="signup">
                <div className="pure-g center-children">
                    <div className="pure-u-12-24">
                        <Box title={`Connecting your Shopify store.`} description="Please wait." footer={action} error={error}>
                            <div style={{paddingTop: padding, paddingBottom: padding, textAlign: "center"}}>
                                {! error ? <CircularProgress /> : <FontIcon className="fa fa-frown-o" color={blueGrey700} style={{fontSize: "6em"}} />}
                            </div>
                        </Box>
                    </div>
                </div>
            </section>
        );
    }
}