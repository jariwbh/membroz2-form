export class FormsModel {
    _id: any;
    name: string;
    status: string;
    formname: string;
    dispalyformname: string;
    schemaname: string;
    formlistname: string;
    sampleCsvPath: string;
    issystemform: boolean;
    tabs: any[];
    addurl: object;
    editurl: object;
    listurl: object;
    geturl: object;
    rootfields: any[];
    gridaction: any[];
    gridactionposition: string;
    formaction: any[];    
    displayfields: any[];
    redirecturl: string;
    formtype : string;
    property: any;

    params: any = {};

    isDynamicForm: boolean;
    ishideaddbutton: boolean;
    ishidecancelbutton: boolean;

    functions: any [] = [];
    langresources: any = {};

}
