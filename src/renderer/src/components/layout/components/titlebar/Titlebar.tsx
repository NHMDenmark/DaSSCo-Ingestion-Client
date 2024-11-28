import { Image, Group, Text, Button } from "@mantine/core";
import DaSSCoLogo from "@renderer/assets/img/dassco-logo.png";
import { IconLogout, IconMinus, IconX } from "@tabler/icons-react";
import TitlebarButton from "./TitlebarButton";
import { KeycloakService } from "@renderer/services/KeycloakService";
import classes from "./Titlebar.module.css";

const Titlebar = () => {
    return (
        <header className={classes.titlebar}>
            <Group justify="space-between" h="100%">

                <Image src={DaSSCoLogo} w={180} />

                {/* <Button className={classes.updateButton}>Update</Button> */}

                <Group gap={0} className={classes.windowControl}>

                    {KeycloakService.isLoggedIn() &&
                        <>
                            <Text size="lg" c="gray" fw={500} >{KeycloakService.getName()}</Text>
                            <Button
                                leftSection={<IconLogout />}
                                size="md"
                                variant="white"
                                onClick={KeycloakService.logout}
                                style={{ outline: 'none', border: 'none' }}
                                mr={12}
                            >
                                Logout
                            </Button>
                        </>
                    }

                    <TitlebarButton message="minimizeApp"><IconMinus color="black" width={24} size={16} /></TitlebarButton>
                    {/* <TitlebarButton message="maximizeApp"><IconSquare color="black" width={34} size={14} /></TitlebarButton> */}
                    <TitlebarButton message="closeApp"><IconX color="black" width={24} size={18} /></TitlebarButton>
                </Group>

            </Group>

        </header>
    )
}

export default Titlebar;