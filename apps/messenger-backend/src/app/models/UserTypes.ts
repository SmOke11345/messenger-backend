export interface User {
    id: number;
    name: string;
    login: string;
    lastname?: string;
    password: string;
    profile_img?: string;
    friends?: Friends[];
}

export interface Friends {
    id: number;
    friend: User;
    friendId: number;
    userId: number;
}
