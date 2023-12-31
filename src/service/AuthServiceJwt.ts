import LoginData from '../model/LoginData';
import UserData from '../model/UserData';
import AuthService from './AuthService';
import { fetchRequest } from './httpService';

export const AUTH_DATA_JWT = 'auth-data-jwt';

function extractJwtPayload(jwt: string) {
    if (!jwt) {
        throw new Error('JWT token is missing or undefined.');
    }
    const jwtPayloadJSON = atob(jwt.split('.')[1]);
    return JSON.parse(jwtPayloadJSON);
}

function getUserData(data: any): UserData {
    const jwt = data.accessToken;
    localStorage.setItem(AUTH_DATA_JWT, jwt);
    const jwtPayloadObj = extractJwtPayload(jwt);
    return { email: jwtPayloadObj.sub, role: jwtPayloadObj.roles.includes('ADMIN') ? 'admin' : 'user' };
}

export default class AuthServiceJwt implements AuthService {
    private urlService: string;

    constructor(private baseUrl: string) {
        this.urlService = baseUrl;
    }

    async login(loginData: LoginData): Promise<UserData> {
        const serverLoginData: any = {};
        serverLoginData.username = loginData.email;
        serverLoginData.password = loginData.password;
        const response = await fetch(this.urlService + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serverLoginData),
        });

        return response.ok ? getUserData(await response.json()) : null;
    }

    async register(loginData: LoginData): Promise<UserData> {
        const urlRegisterService = this.urlService;
        const serverRegisterData = {
            username: loginData.email,
            password: loginData.password,
            nickname: loginData.nickname,
        };
        try {
            const response = await fetchRequest(
                urlRegisterService,
                { method: 'POST' },
                serverRegisterData,
            );
            if (response.status !== 201) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error during registration');
            }
            return this.login(loginData);
        } catch (error: any) {
            throw new Error(error.message || 'Unknown error during registration');
        }
    }

    async logout(): Promise<void> {
        const currentUserJWT = localStorage.getItem(AUTH_DATA_JWT);
        if (currentUserJWT) {
            const jwtPayloadObj = extractJwtPayload(currentUserJWT);
            const username = jwtPayloadObj.sub;

            try {
                const response = await fetch(this.urlService + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });

                if (response.ok) {
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        } else {
            console.warn('No JWT found in local storage');
        }
    }

    async checkEmailExists(email: string): Promise<boolean> {
        const response = await fetch(this.urlService + "/check-email", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: {
                "Content-Type": "application/json",
            },
        });        
        const data = await response.json();
        return data.exists; 
    }
}
