import KcAdminClient from '@keycloak/keycloak-admin-client'
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation'
import { useCallback, useEffect, useState } from 'react'

export const useKeycloakAdmin = () => {
  const [adminClient, setAdminClient] = useState<KcAdminClient | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const authenticate = useCallback(async () => {
    try {
      console.log('Authenticating with Keycloak admin...');
      const client = new KcAdminClient({
        baseUrl: import.meta.env.VITE_KEYCLOAK_URL,
        realmName: import.meta.env.VITE_KEYCLOAK_REALM
      })
      await client.auth({
        clientId: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_ID,
        clientSecret: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_SECRET,
        grantType: 'client_credentials'
      });
      console.log('Authenticated successfully!')
      setAdminClient(client);
      setAuthenticated(true);
    } catch (error) {
      console.error('Keycloak admin authentication failed:', error)
      setAuthenticated(false);
    }
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const setupAuthentication = async () => {
      await authenticate();
      intervalId = setInterval(authenticate, 4 * 60 * 1000);
    }

    setupAuthentication();

    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [authenticate])

  const getDigitisers = useCallback(async (): Promise<UserRepresentation[]> => {
    console.log('getDigitisers called, adminClient:', adminClient)
    if (!adminClient) throw new Error('Keycloak admin client not authenticated')
    const digitisers = await adminClient.groups.listMembers({
      id: import.meta.env.VITE_KEYCLOAK_GROUP_ID
    })
    console.log('Digitisers fetched:', digitisers)
    return digitisers;
  }, [adminClient])

  return {
    getDigitisers,
    authenticated,
    adminClient,
  }
}