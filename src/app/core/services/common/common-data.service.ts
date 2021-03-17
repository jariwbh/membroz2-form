

export class CommonDataService {
    tempbindid : any;
    authId: string;
    a: any;
    nn:string;
    filterDataForGlobalSearchparams: any;
    isfilterDataForGlobalSearch = false;

    filterDataForDynamicPagesparams: any;
    isfilterDataForDynamicPages = false;

    filterDataparams: any;
    reportDataparams: any;
    filterfieldoptionsaparams:any;

    filterstaffattandancesaparams:any;
    
    isfilterData = false;
    isReportData = false;
    reportFromDate: Date;
    reportToDate: Date;
    reportParams: any;
    dateDDStateParams: string; 
    dateDDStateForNextParams: string;
    isFromPaymentDetail: boolean = false;

    _userNamewithOtp: any;
    summaryfilterDataparams: any;
    summaryfilterDataIds: any;

    isfromAppointmentCalfrontdesk2Page = false;
    isfromAppointmentCalfrontdeskPage = false;
    isfromfacbookConfPage = false;
    isfromPaymentListPages = false;
    isfromPaymentDetailListPages = false;
    currentPaymentDetailListPageMember: any;
    isfreeze = false;
    currentRedirectParams: any = {};
    
    currentTemplateType: any;

    timesheetDataparams: any;
    constructor() {
        
        this.isfilterDataForDynamicPages = false;
        this.isfilterDataForGlobalSearch = false;

        this.filterDataForGlobalSearchparams = {
            'search': [],
            'select': [],
            'sort': {},
            'tabname': '',
            'returnURl': ''
        }

        this.filterDataForDynamicPagesparams = {
            'search': [],
            'searchref': [],
            'select': [],
            'sort': {},
            'tabname': '',
            'returnURl': '',
            'searchtype': '',
        }

        this.filterDataparams = {
            'search': [],
            'select': [],
            'sort': {}
        }

        this.filterfieldoptionsaparams = {
            'search': [],
            'select': [],
            'sort': {}
        }

        this.filterstaffattandancesaparams = {
            'search': [],
            'select': [],
            'sort': {}
        }
        
        this.reportDataparams = {
            'search': [],
            'select': [],
            'sort': "",
            'refsearch': {}
        }
    }

}
