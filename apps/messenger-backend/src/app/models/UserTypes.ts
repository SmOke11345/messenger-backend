export interface User {
    id: number;
    name: string;
    email: string;
    lastname?: string;
    password: string;
    profile_img?: string;
    friends: Object[];
}
