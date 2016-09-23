import * as React from "react";
import {AppBar} from "material-ui";
import {AppName} from "../modules/strings";

export default function NavBar(props: any) {
    return (
        <AppBar title={AppName} />
    )
}