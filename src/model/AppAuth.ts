import { User } from "@/model/User";

declare type Unsubscribe = () => void;

export default interface AppAuth {
    isSignedIn(): boolean;
    signIn(email: string, pass: string): Promise<User>;
    signOut(): Promise<void>;
    onAuthStateChanged(observer: () => void): Unsubscribe;
};
