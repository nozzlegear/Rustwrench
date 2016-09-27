import * as React from "react";
import {Link} from "react-router";
import Paths from "../modules/paths";
import {AppName} from "../modules/strings";
import {MuiThemeProvider} from "material-ui/styles";

export default function MainWithoutNav(props) {
    return (
        <MuiThemeProvider>
            <main id="app" className="minimal"> 
                <div id="body">
                    <div className="page-header">
                        <Link to={Paths.home.index}>{AppName}</Link>
                    </div>
                    {React.cloneElement(props.children as any, props)}
                </div>
            </main>
        </MuiThemeProvider>
    )
}