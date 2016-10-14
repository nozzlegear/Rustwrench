import Dialog from "./dialog"
import * as React from 'react';
import * as gravatar from "gravatar";
import Nav from "../../components/nav";
import {IReduxState} from "../../reducers";
import {
    Card,
    CardHeader,
    CardText,
    CardActions,
    RaisedButton,
    TextField,
} from "material-ui";

export interface IProps extends IReduxState {
    
}

export interface IState {
    emailDialogOpen?: boolean;
    passwordDialogOpen?: boolean;
}

export default class AccountPage extends React.Component<IProps, IState> {
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
    
    public componentDidMount() {
        
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        const {emailDialogOpen, passwordDialogOpen} = this.state;
        const props = this.props;
        const {auth} = props;

        return (
            <div>
                <Nav {...this.props} />
                <section id="account" className="content">
                    <h2 className="content-title">{"Your Account"}</h2>
                    <div className="pure-g">
                        <div className="pure-u-12-24">
                            <Card>
                                <CardHeader title={auth.shopName} subtitle={auth.userId} avatar={gravatar.url(auth.userId)} />
                                <CardText>
                                    <p className="underline">{"Date Created:"} <span>{new Date(auth.dateCreated).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</span></p>
                                    <p className="underline">{"Shop URL:"}<span>{auth.shopifyUrl}</span></p>
                                </CardText>
                                <CardActions>
                                    <RaisedButton label="Change Login Email" onTouchTap={e => this.setState({emailDialogOpen: true})} />
                                    <RaisedButton label="Change Login Password" style={{float:"right"}} onTouchTap={e => this.setState({passwordDialogOpen: true})} />
                                </CardActions>
                            </Card>
                        </div>
                    </div>
                    <Dialog open={emailDialogOpen} type="email" onRequestClose={() => this.setState({emailDialogOpen: false})} />
                    <Dialog open={passwordDialogOpen} type="password" onRequestClose={() => this.setState({passwordDialogOpen: false})} />
                </section>
            </div>
        );
    }
}