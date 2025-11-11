import { Box } from "@mantine/core";
import Ingestion from "@renderer/pages/ingest/Ingestion";
import { KeycloakService } from "@renderer/services/KeycloakService";
import Login from "@renderer/pages/login/Login";
import Titlebar from "./components/titlebar/Titlebar";


const Layout = () => {
    return (
        <Box>
            <Titlebar />
            <main style={{ paddingTop: "50px"}}>

            </main>
            {
                KeycloakService.isLoggedIn() ?
                    <Ingestion />
                    :
                    <Login />
            }
        </Box>
    )
}

export default Layout;