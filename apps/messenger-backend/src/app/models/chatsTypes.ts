export type UserType = {
    user: UserChatsType;
};

type UserChatsType = {
    id: number;
    name: string;
    lastname: string;
    profile_img: string;
};

type MembersType = {
    userId: number;
    chatId: number;
};

export type MessageType = {
    id: number;
    content: string;
    senderId: number;
    chatId: number;
    createdAt: Date;
    updatedAt: Date;
};

export type ChatsType = {
    id: number;
    members: UserType[];
    messages: MessageType[];
};

export interface IChatMemberships extends MembersType {
    chat: { id: number };
}

export type FindMembershipType = {
    id: number;
    members: MembersType[];
};

export interface IGroupMessage {
    date: string;
    messages: MessageType[];
}
