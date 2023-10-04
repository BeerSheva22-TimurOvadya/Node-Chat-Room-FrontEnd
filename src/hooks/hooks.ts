import { useDispatch } from 'react-redux';
import CodePayload from '../model/CodePayload';
import CodeType from '../model/CodeType';
import { codeActions } from '../redux/slices/codeSlice';
import { useEffect, useState } from 'react';
import Message from '../model/Message';
import { useSelector } from 'react-redux';
import { Subscription } from 'rxjs';
import { messagesService, usersService } from '../config/service-config';
import User from '../model/User';


function handleDispatchError(error: string): { code: CodeType, message: string } {
    let code: CodeType = CodeType.OK;
    let message: string = '';

    if (error.includes('Authentication')) {
        code = CodeType.AUTH_ERROR;
        message = 'Authentication error, moving to Sign In';
    } else {
        code = error.includes('unavailable') ? CodeType.SERVER_ERROR : CodeType.UNKNOWN;
        message = error;
    }

    return { code, message };
}


export function useDispatchCode() {
    const dispatch = useDispatch();
    return (error: string, successMessage: string) => {
        const { code, message } = handleDispatchError(error);
        dispatch(codeActions.set({ code, message: message || successMessage }));
    };
}


export function useSelectorMessages() {
    const dispatch = useDispatchCode();
    const [messages, setMessages] = useState<Message[]>([]);
    
    useEffect(() => {
        const subscription: Subscription = messagesService.getMessages().subscribe({
            next(response: Message[] | string) {
                if (typeof response === 'string') {
                    dispatch(response, '');
                } else {
                    setMessages(response.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
                }
            },
        });
        
        return () => subscription.unsubscribe();
    }, []);
    
    return messages;
}


export function useSelectorUsers() {
    const dispatch = useDispatchCode();
    const [users, setUsers] = useState<User[]>([]);
    
    useEffect(() => {
        const subscription: Subscription = usersService.getAllAccounts().subscribe({
            next(response: User[] | string) {
                if (typeof response === 'string') {
                    dispatch(response, '');
                } else {
                    setUsers(response);
                }
            },
        });
        
        return () => subscription.unsubscribe();
    }, []);
    console.log("HOOK", users)
    return users;
}
