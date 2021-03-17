import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Configuration } from './../../../app.constants';


@Injectable()
export class OrgnizationsettingService {

    constructor(
        private http: HttpClient, 
    ) {
        
    }

    public GetBySetting = (actionurl: any, header: any): Observable<any> => {
        return this.http
            .get(actionurl + 'organizationsettings', { headers: header })
    }

    
}