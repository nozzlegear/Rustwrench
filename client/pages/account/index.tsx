import * as React from 'react';
import Nav from "../../components/nav";
import {IReduxState} from "../../reducers";
import * as gravatar from "gravatar";
import {
    Card,
    CardHeader,
} from "material-ui";

export interface IProps extends IReduxState {
    
}

export interface IState {
    
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
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}