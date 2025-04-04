import Keycloak from "keycloak-js";

const _kc = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const redirectUri = 'http://localhost/keycloak-redirect';

const initKeycloak = (onInitCallBack: () => void) => {
    _kc.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        responseMode: 'query',
        enableLogging: true,
        redirectUri: redirectUri

    }).then((_authenticated) => {
        if(_authenticated) console.log('User authenticated');
        onInitCallBack();
    }).catch(console.error);
}

_kc.onTokenExpired = () => {
    _kc.updateToken(5).then(() => {
        console.log('token refreshed')
    }).catch(console.error)
}

const getName = () : string => _kc.tokenParsed?.name;

const getUsername = () : string => _kc.tokenParsed?.preferred_username;

const getEmail = () : string => _kc.tokenParsed?.email;

const login = () : Promise<void> => _kc.login();

const logout = () : Promise<void> => _kc.logout();

const hasRole = (roles: string[]) : boolean => roles.some((role: any) => _kc.hasRealmRole(role));

const refreshToken = async() : Promise<boolean> => {
    return await _kc.updateToken(5);
}

const isLoggedIn = () => _kc.authenticated;

const getToken = () : string => _kc.token as string;

const getLoginUrl = () : string => {
    return _kc.createLoginUrl()
}

export const KeycloakService = {
    initKeycloak,
    getName,
    getUsername,
    getEmail,
    login,
    logout,
    hasRole,
    refreshToken,
    getToken,
    isLoggedIn,
    getLoginUrl
}