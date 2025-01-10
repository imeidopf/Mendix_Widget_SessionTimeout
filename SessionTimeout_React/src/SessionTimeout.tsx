import { createElement } from "react";
import SessionTimeout from "./components/SessionTimeout";
import { SessionTimeoutContainerProps } from "../typings/SessionTimeoutProps";

export default function SessionTimeoutContainer(props: SessionTimeoutContainerProps) {
  return (
    <SessionTimeout 
      paramMinutes= {props.paramMinutes}
      paramModalDuration = {props.paramModalDuration}
      paramTitle = {props.paramTitle}
      paramMessage = {props.paramMessage}
      // paramNavAwayLink = {props.paramNavAwayLink?.valueOf()}
    />
  );
}