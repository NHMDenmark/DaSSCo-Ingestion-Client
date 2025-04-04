import KeycloakAdminClient from '@keycloak/keycloak-admin-client'
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation'
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { useEffect, useState } from 'react'

export const useKeycloakAdmin = () => {
  const [adminClient, setAdminClient] = useState<KeycloakAdminClient | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const credentials : Credentials = {
    clientId: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_ID,
    clientSecret: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_SECRET,
    grantType: 'client_credentials'
  }

  const authenticate = async() => {
    try {
      const client = new KeycloakAdminClient({
        baseUrl: import.meta.env.VITE_KEYCLOAK_URL,
        realmName: import.meta.env.VITE_KEYCLOAK_REALM
      })

      await client.auth(credentials);

      setAdminClient(client);
      setAuthenticated(true);

    } catch(error) {
      setAuthenticated(false);
    }
  }

  

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const setupAuthentication = async () => {
      await authenticate();

      intervalId = setInterval(authenticate, 4 * 60 * 1000);

      return () => {
        if(intervalId) clearInterval(intervalId);
      }
    }    

    const cleanup = setupAuthentication();

    return () => {
      cleanup.then(cleanupFn => cleanupFn());
    }
  }, [])

  const getDigitisers = async (): Promise<UserRepresentation[]> => {
    if(!adminClient) throw new Error('Keycloak admin client not authenticated')

    try {
      const digiters = await adminClient.groups.listMembers({
        id: import.meta.env.VITE_KEYCLOAK_GROUP_ID
      })
      return digiters;

    } catch(err) {
      throw err;
    }
  }

  return {
    getDigitisers,
    authenticated
  }
}
