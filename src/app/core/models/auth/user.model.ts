export class UserModel {  
    username: string;
    password: string;
    token: string;
    _id: string;
    role: string;
    designationid: string;
    branchid: string;
    roletype: string;
    currency: string;
    language: string;
    cloud_name: string;
    organizationsetting: any;
    salarycomponent: any [] = [];
    leavecomponent: any [] = [];
    netsalary: number;
    user: any;
    property: any;
    rtl: boolean;
    fullname: string;
    namenumber: string;
    profileimage: string;
    availability: any[] =[];
    servicecharges: any[] =[];
    status: string;
}
