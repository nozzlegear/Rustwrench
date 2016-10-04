import * as React from 'react';
import Nav from "../../components/nav";
import {Shopify} from "../../modules/api";
import {IReduxState} from "../../reducers";
import {store} from "../../modules/redux_store";
import {Actions} from "../../reducers/dashboard";
import DeleteIcon from "material-ui/svg-icons/action/delete";
import NewOrderDialog from "../../components/new_order_dialog";
import SelectAllIcon from "material-ui/svg-icons/content/select-all";
import {
    CircularProgress,
    Toolbar,
    ToolbarGroup,
    ToolbarTitle,
    FontIcon,
    FloatingActionButton,
    DropDownMenu,
    MenuItem,
    IconButton,
    IconMenu,
    Snackbar,
} from "material-ui";
import {
    Table, 
    TableBody, 
    TableHeader, 
    TableRow as TR, 
    TableHeaderColumn as TH, 
    TableRowColumn as TD
} from "material-ui/Table";

export interface IProps extends IReduxState {
    
}

export interface IState {
    loading?: boolean;
    error?: string;
    dialogOpen?: boolean;
    selectedRows?: string | number[];
}

export default class HomePage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = { }
        
        if (!useSetState) {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }

    private getLineDescription(o: any) {
        const first: {name: string; quantity: number} = o.lineItems[0];
        const suffix = o.lineItems.length > 1 ? ` and ${o.lineItems.length - 1} other items` : "";

        return `${first.quantity} x ${first.name}${suffix}.`;
    }

    private rowIsSelected(index: number) {
        const rows = this.state.selectedRows;

        if (Array.isArray(rows)) {
            return rows.some(r => r === index);
        } else if (rows === "all") {
            return true;
        }

        return false;
    }
    
    //#endregion

    private closeErrorSnackbar(reason: "timeout" | "clickaway" | string) {
        // Only hide the snackbar if its duration has expired. This prevents clicking anywhere on the app
        // and inadvertantly closing the snackbar.
        if (reason === "timeout") {
            this.setState({error: undefined});
        }
    }

    private async toggleStatus(id: number | string, setStatusTo: "open" | "closed") {
        if (this.state.loading) {
            return;
        }

        this.setState({loading: true, selectedRows: []});

        const api = new Shopify(this.props.auth.token);
        let error: string = undefined;
        let order: any;

        try {
            const result = await (setStatusTo === "open" ? api.openOrder(id) : api.closeOrder(id));

            if (!result.ok) {
                error = result.error.message;
            } else {
                order = result.data;
            }
        } catch (e) {
            console.error(e);

            error = "Something went wrong and your order could not be updated.";
        }

        this.setState({loading: false, error: error}, () => {
            if (order) {
                store.dispatch(Actions.updateOrder(id, order));
            }
        })
    }

    private async deleteOrder(id: number | string) {
        if (this.state.loading) {
            return;
        }

        this.setState({loading: true, selectedRows: []});

        const api = new Shopify(this.props.auth.token);
        let error: string = undefined;
        let success = false;

        try {
            const result = await api.deleteOrder(id);

            success = result.ok;
            error = result.error && result.error.message;
        } catch (e) {
            console.error(e);

            error = "Something went wrong and your order could not be deleted.";
        }

        this.setState({loading: false, error: error}, () => {
            if (success) {
                store.dispatch(Actions.removeOrder(id));
            }    
        })
    }
    
    public async componentDidMount() {
        const api = new Shopify(this.props.auth.token);
        let orders: any[] = [];
        let error: string = undefined;

        try {
            const result = await api.listOrders({limit: 100, page: 1});

            if (!result.ok) {
                console.error(result.error);

                error = result.error.message;
            } else {
                orders = result.data;
            }
        } catch (e) {
            console.error(e);

            error = "Something went wrong and we could not load your orders.";
        }

        this.setState({error}, () => {
            store.dispatch(Actions.setOrders(orders));
        });
    }
    
    public componentDidUpdate() {
        
    }
    
    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }
    
    public render() {
        let body: JSX.Element;
        let toolbar: JSX.Element;

        if (!this.props.dashboard.loaded) {
            body = ( 
                <div className="text-center" style={{paddingTop: "50px", paddingBottom: "50px"}}>
                    <CircularProgress />
                </div>
            );
        } else {
            body = (
                <Table onRowSelection={rows => this.setState({selectedRows: rows})} >
                    <TableHeader>
                        <TR>
                            <TH>{"Id"}</TH>
                            <TH>{"Customer Name"}</TH>
                            <TH>{"Line Item Summary"}</TH>
                            <TH>{"Status"}</TH>
                        </TR>
                    </TableHeader>
                    <TableBody deselectOnClickaway={false}>
                        {this.props.dashboard.orders.map((o, i) => (
                            <TR key={o.id} selected={this.rowIsSelected(i)} >
                                <TD>{o.orderNumber}</TD>
                                <TD>{`${o.customer.firstName} ${o.customer.lastName}`}</TD>
                                <TD>{this.getLineDescription(o)}</TD>
                                <TD>{o.closedAt ? `Closed on ${new Date(o.closedAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}` : "Open"}</TD>
                            </TR>
                        ))}
                    </TableBody>
                </Table>
            )
        };

        if (this.state.selectedRows && this.state.selectedRows.length > 0) {
            const order = this.props.dashboard.orders[this.state.selectedRows[0]];
            const theme = this.props.theme.rawTheme.palette;
            const toolbarStyle = {
                backgroundColor: theme.primary2Color,
                borderColor: theme.borderColor,
            }
            const groupStyle = {
                alignItems: "center"
            }

            toolbar = (
                <Toolbar 
                    className="sticked-toolbar" 
                    style={toolbarStyle}>
                    <ToolbarGroup firstChild={true}>
                        <DropDownMenu 
                            value={!!order.closedAt ? "closed" : "open"}
                            onChange={(e, i, v) => this.toggleStatus(order.id, order.closedAt ? "open" : "closed")}
                            labelStyle={{color: theme.alternateTextColor}}>
                            <MenuItem value={"open"} primaryText="Open" />
                            <MenuItem value={"closed"} primaryText="Closed" />
                        </DropDownMenu>
                    </ToolbarGroup>
                    <ToolbarGroup style={groupStyle}>
                        <IconButton 
                            iconStyle={{color: theme.alternateTextColor}} 
                            title="Unselect All"
                            onTouchTap={e => this.setState({selectedRows: []})}>
                            <SelectAllIcon />
                        </IconButton>
                        <IconMenu iconButtonElement={<IconButton iconStyle={{color: theme.alternateTextColor}} title="Delete"><DeleteIcon /></IconButton>}>
                            <MenuItem primaryText="Delete Order" onTouchTap={e => this.deleteOrder(order.id)} />
                        </IconMenu>
                    </ToolbarGroup>
                </Toolbar>
            );
        }

        return (
            <div>
                <Nav {...this.props} rightIconClass="fa fa-plus" onRightIconTouchTap={e => this.setState({dialogOpen: true})} />
                <section id="home" className="content">
                    <h2>{`Latest Orders for ${this.props.auth.shopName}`}</h2>
                    {body}
                </section>
                {toolbar}
                {this.state.error ? <Snackbar open={true} autoHideDuration={10000} message={this.state.error} onRequestClose={e => this.closeErrorSnackbar(e)} /> : null}
                <NewOrderDialog apiToken={this.props.auth.token} open={this.state.dialogOpen} onRequestClose={() => this.setState({dialogOpen: false})} />
            </div>
        );
    }
}