import { UnstyledButton } from "@mantine/core";
import { ReactNode } from "react";
import classes from "./Titlebar.module.css";

type TitlebarButtonProps = {
    message: "minimizeApp" | "maximizeApp" | "closeApp";
    children: ReactNode;
}

const TitlebarButton = ({ message, children} : TitlebarButtonProps) => (
    <UnstyledButton onClick={() => {
        window.context.sendMessage(message, message);
    }} className={message === 'closeApp' ? classes.closeButton : classes.adjustButton} p={18}>
        {children}
    </UnstyledButton>
)

export default TitlebarButton;