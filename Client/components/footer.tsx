import * as React from "react";
import {AppName} from "../modules/strings";

export default function Footer(props: any) {
    return (
        <footer id="footer">
            <div>
                <p>
                    {`© ${AppName}, ${new Date().getUTCFullYear()}. All rights reserved.`}
                </p>
                <p>
                    {"Powered by "}
                    <a target="_blank" href="https://github.com/nozzlegear/rustwrench">
                        {"Rustwrench"}
                    </a>
                    {"."}
                </p>
            </div>
        </footer>
    )
}