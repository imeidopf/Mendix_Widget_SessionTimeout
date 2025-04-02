/**
 * This file was generated from SessionTimeout.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";

export interface SessionTimeoutContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    isLoginPage: boolean;
    paramMinutes: number;
    paramTitle: string;
    paramMessage: string;
    paramConfirm: string;
    paramCancel: string;
    paramModalDuration: number;
    paramNavAwayLink: string;
}

export interface SessionTimeoutPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    isLoginPage: boolean;
    paramMinutes: number | null;
    paramTitle: string;
    paramMessage: string;
    paramConfirm: string;
    paramCancel: string;
    paramModalDuration: number | null;
    paramNavAwayLink: string;
}
