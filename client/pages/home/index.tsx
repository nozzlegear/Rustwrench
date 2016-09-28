import * as React from 'react';
import {Shopify} from "../../modules/api";
import {IReduxState} from "../../reducers";
import {
    Table, 
    TableBody, 
    TableHeader, 
    TableRow as TR, 
    TableHeaderColumn as TH, 
    TableRowColumn as TD
} from "material-ui/Table";
import {CircularProgress, RaisedButton, FontIcon} from "material-ui";

export interface IProps extends IReduxState {
    
}

export interface IState {
    orders?: any[];
    loaded?: boolean;
    error?: string;
}

export default class HomePage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {
            orders: [],
        }
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion
    
    public async componentDidMount() {
        const api = new Shopify(this.props.auth.token);

        try {
            const result = await api.listOrders({limit: 100, page: 1});

            if (!result.ok) {
                console.error(result.error);
                this.setState({error: result.error.message})
            } else {
                console.log("Result was okay");
                this.setState({orders: result.data});
            }
        } catch (e) {
            console.error(e);
            this.setState({error: "Something went wrong and we could not load your orders."});
        }

        this.setState({loaded: true});
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        let body: JSX.Element;

        if (!this.state.loaded) {
            body = ( 
                <div className="text-center" style={{paddingTop: "50px", paddingBottom: "50px"}}>
                    <CircularProgress />
                </div>
            );
        } else {
            body = (
                <Table>
                    <TableHeader>
                        <TR>
                            <TH>{"Id"}</TH>
                            <TH>{"Customer Name"}</TH>
                            <TH>{"Line Item Summary"}</TH>
                            <TH>{"Financial Status"}</TH>
                        </TR>
                    </TableHeader>
                    <TableBody>
                        {this.state.orders.map(o => (
                            <TR key={o.id}>
                                <TD>{o.id}</TD>
                                <TD></TD>
                                <TD></TD>
                                <TD></TD>
                            </TR>
                        ))}
                    </TableBody>
                </Table>
            )
        }

        return (
            <section id="home">
                <h2>{`Latest Orders for ${this.props.auth.shopName}`}</h2>
                {body}
                <p className="error">{this.state.error}</p>
            </section>
        );
    }
}