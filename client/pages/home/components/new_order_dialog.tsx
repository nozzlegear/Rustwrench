import * as React from 'react';
import {
    Dialog, 
    RaisedButton, 
    TextField, 
    Divider, 
    FlatButton, 
    SelectField, 
    MenuItem
} from "material-ui";
import {AutoPropComponent} from "auto-prop-component";

export interface IProps extends React.Props<any> {
    open: boolean;
    onRequestClose: () => void;
}

export interface IState {
    loading?: boolean;
    name?:string;
    email?:string;
    street?:string;
    city?:string;
    state?:string;
    zip?:string;
    lineItem?:string;
    quantity?:number;
}

export default class NewOrderDialog extends AutoPropComponent<IProps, IState> {
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
        const state = this.state;
        const actions = [
            <FlatButton 
                key="close_dialog" 
                label="Close" 
                style={{float:"left"}}
                onTouchTap={e => props.onRequestClose()} />,
            <RaisedButton
                key="save_order"
                label="Save Order"
                primary={true}
                onTouchTap={e => undefined} />,
        ]

        return (
            <Dialog 
                open={props.open || false} 
                actions={actions} 
                modal={true}
                title="New Order" 
                onRequestClose={e => props.onRequestClose()}>
                <form className="pure-g">
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="Customer Name" 
                            hintText={"Jane Doe"} 
                            defaultValue={state.name}
                            onChange={this.updateStateFromEvent((s, v) => s.name = v)} />
                    </div> 
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="Customer Email" 
                            hintText={"jane.doe@example.com"}
                            defaultValue={state.email} 
                            onChange={this.updateStateFromEvent((s,v) => s.email = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="Street Address" 
                            hintText={"123 4th Street"} 
                            defaultValue={state.street}
                            onChange={this.updateStateFromEvent((s, v) => s.street = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="City" 
                            hintText="Smalltown" 
                            defaultValue={state.city}
                            onChange={this.updateStateFromEvent((s, v) => s.city = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="State/Province" 
                            hintText="Minnesota" 
                            defaultValue={state.state}
                            onChange={this.updateStateFromEvent((s, v) => s.state = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="ZIP/Postal Code" 
                            hintText="12345" 
                            defaultValue={state.zip}
                            onChange={this.updateStateFromEvent((s, v) => s.zip = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="Line Item" 
                            hintText="Barrel of Fun"
                            defaultValue={state.lineItem} 
                            onChange={this.updateStateFromEvent((s, v) => s.lineItem = v)} />
                    </div>
                    <div className="form-group pure-u-12-24">
                        <TextField 
                            floatingLabelText="Quantity" 
                            hintText="12" 
                            value={state.quantity}
                            onChange={this.updateStateFromEvent((s, v) => s.quantity = v)} />
                    </div>
                </form>
            </Dialog>
        );
    }
}