import {findIndex} from "lodash";
import {Action as IAction} from "rustwrench";

export type ActionType = (
    "ADD_ORDER" |
    "UPDATE_ORDER" |
    "SET_ORDERS" |
    "REMOVE_ORDER"
);

export interface State {
    orders: any[];
    loaded: boolean;
}

export interface Action extends IAction<ActionType, State> {  }

export interface IActions {
    addOrder: (order: any) => Action;
    updateOrder: (id: number | string, order: any) => Action;
    setOrders: (orders: any[]) => Action;
    removeOrder: (id: number | string) => Action;
}

export const Actions: IActions = {
    addOrder: (order) => ({
        type: "ADD_ORDER",
        reduce: state => {
            // Orders are returned by Shopify sorted newest to oldest. Add the newest order to the top of the list
            const orders = [...state.orders];
            orders.unshift(order);

            return Object.assign({}, state, {orders});
        }  
    }),
    updateOrder: (id, order) => ({
        type: "UPDATE_ORDER",
        reduce: state => {
            const index = findIndex(state.orders, o => o.id === id);
            const orders = [
                ...state.orders.splice(0, index),
                order,
                ...state.orders.splice(1)
            ];

            return Object.assign({}, state, {orders});
        }
    }),
    setOrders: (orders) => ({
        type: "SET_ORDERS",
        reduce: state => Object.assign({}, state, {orders, loaded: true})        
    }),
    removeOrder: (id) => ({
        type: "REMOVE_ORDER",
        reduce: state => {
            const orders = [ ...state.orders.filter(o => o.id !== id) ]

            return Object.assign({}, state, {orders});
        }
    })
}

export default function dashboardReducer(state: State, action: Action) {
    if (!state) {
        state = {
            orders: [],
            loaded: false,
        }
    }

    switch (action.type) {
        case "ADD_ORDER": 
        case "UPDATE_ORDER":
        case "SET_ORDERS":
        case "REMOVE_ORDER":
            state = action.reduce(state);
        break;

        default: 
        // This reducer did not run, so return the original state. Doing so will prevent the reducer 
        // from needlessly updating all dependent components.
        return state;
    }

    // Redux reducers must always return a new object, else they won't update their dependent components.
    return Object.assign({}, state);
}