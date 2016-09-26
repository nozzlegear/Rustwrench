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

    export interface SessionToken extends User {
        /**
         * The date and time that the user's auth expires, in Unix-epoch seconds.
         */
        exp: number;
    }

    export interface User {
        /**
         * The user's id and username.
         */
        userId: string;
        /**
         * The user's permissions.
         */
        permissions: string[];
    }
}