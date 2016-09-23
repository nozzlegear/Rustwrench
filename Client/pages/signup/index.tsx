import * as React from 'react';
import Box from "../../components/box";
import {AppName} from "../../modules/strings";

export interface IProps extends React.Props<any> {
    
}

export interface IState {
    
}

export default class SignupPage extends React.Component<IProps, IState> {
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
        return (
            <section id="signup">
                <div className="pure-g center-children">
                    <div className="pure-u-12-24">
                        <Box title={`Start your ${AppName} account.`}>

                        </Box>
                    </div>
                </div>
            </section>
        );
    }
}