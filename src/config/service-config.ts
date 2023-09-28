
import AuthService from '../service/AuthService';
import AuthServiceJwt from '../service/AuthServiceJwt';
import MessagesService from '../service/MessagesService';
import MessagesServiceRest from '../service/MessagesServiceRest';
import UsersService from '../service/UsersService';
import UsersServiceRest from '../service/UsersServiceRest';


export const authService: AuthService = new AuthServiceJwt('localhost:8080/users');
export const messagesService: MessagesService = new MessagesServiceRest('http://localhost:8080/messages');
export const usersService: UsersService = new UsersServiceRest('http://localhost:8080/users');
