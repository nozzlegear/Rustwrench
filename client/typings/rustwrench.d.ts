declare module "rustwrench" {
    import * as React from "react";
    import * as Router from "react-router";

    export interface Action<TYPE, STATE> {
        type: TYPE;
        reduce: (state: STATE) => STATE;
    }

    export interface IDefaultReduxState {
        location?: Location;
        history?: History;
        route?: Router.PlainRoute;
    }

    interface IUser {
        /// <summary>
        /// The user's username/id. MyCouch will automatically set this as the CouchDB id.
        /// </summary>
        userId: string;

        shopifyUrl: string;

        shopName: string;

        shopId?: number;

        shopifyChargeId?: number;

        permissions: string[];

        dateCreated: string;
    }

    export interface SessionToken extends IUser {
        token: string;

        /**
         * The date and time that the user's auth expires, in Unix-epoch seconds.
         */
        exp: number;
    }
}