import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Configuration } from './../../../app.constants';


@Injectable()
export class PublicService {

    constructor(
        private http: HttpClient, 
        private configuration: Configuration
    ) {
        console.log("configuration", this.configuration);
    }

    public paymentgateway = (data: any): Observable<any> => {
        
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/paymentgateway', toAdd, { headers: this.configuration.headers})
    }

    public onlinepayment = (data: any): Observable<any> => {
        
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/onlinepayment', toAdd, { headers: this.configuration.headers})
    }

    public stripeSuccess = (data: any): Observable<any> => {
        
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/stripesuccess', toAdd, { headers: this.configuration.headers})
    }

    public razorpaySuccess = (data: any): Observable<any> => {
        
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/razorpaysuccess', toAdd, { headers: this.configuration.headers})
    }

    public createFormData = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/createformdata', toAdd, { headers: this.configuration.headers })
    }

    public GetByFormId = (id: number): Observable<any> => {
        return this.http
            .get(this.configuration.actionUrl + 'public/forms/' + id, { headers: this.configuration.headers })
    }

    public GetFormFieldByFormId = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'public/formfields/filter', toAdd, { headers: this.configuration.headers})
    }
}