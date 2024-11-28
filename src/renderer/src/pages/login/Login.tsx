import { Button, Center } from "@mantine/core";
import { KeycloakService } from "@renderer/services/KeycloakService";

const Login = () => {
    const login = () => {
        const loginUrl: string = KeycloakService.getLoginUrl();
        window.context.login(loginUrl);
    }

    return <Center mt={100}>
        <Button onClick={login}>Sign in</Button>
    </Center>
}

export default Login;