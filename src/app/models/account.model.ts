import { Group } from "./group.model";

export class Account {
    id:string;
    name:string;
    groupId: string;
    group:Group[];
    openingBalance: number;
    natureOfOB: string;
    description: string;
    //used for sundery debtors, creditors and users
    address?:string;
    mobile?:string;
    //used only for users
    password?:string;
    admin:number = 0;
    //used for computational purposes only
    name_mobile:string;
}  