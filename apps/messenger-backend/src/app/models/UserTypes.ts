export interface User {
    id: number;
    name: string;
    login: string;
    lastname?: string;
    password: string;
    profile_img?: string;
    friends: Object[];
}
