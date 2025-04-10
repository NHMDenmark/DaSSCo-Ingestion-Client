import { Button, Center, Stack, Title, TypographyStylesProvider } from '@mantine/core'
import { KeycloakService } from '@renderer/services/KeycloakService'
import { useEffect, useState } from 'react'

const Login = () => {
  const [appVersion, setAppVersion] = useState('');

  const login = () => {
    const loginUrl: string = KeycloakService.getLoginUrl()
    window.context.login(loginUrl)
  }

  const getAppVersion = async () => {
    const version = await window.context.getAppVersion();
    setAppVersion(version);
  }

  useEffect(() => {
    getAppVersion();
  }, [])

  const html =
  '<p>Login via your keycloak credentials.&nbsp;<br>To get a login, contact support@dassco.dk with&nbsp;<br>Subject: New login for Ingestion Client&nbsp;<br>Please create a new Login with Username: XXXXXX&nbsp;<br>Full Name of the Ingestor:&nbsp;<br>Email:&nbsp;<br>Reason for the new login</p><p>Email will be replied to with a password.&nbsp;<br>Change the password on first login into Keycloak pop-up window.</p>'

  return (
    <Stack p="lg">
      <Title order={3}>Welcome to Ingestion Client Version {appVersion} </Title>

      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </TypographyStylesProvider>

      <Center mt={19}>
        <Button onClick={login}>Sign in</Button>
      </Center>
    </Stack>
  )
}

export default Login
