import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

import { UserModel } from '../../models/auth/user.model';
import { FormsService } from '../../services/forms/forms.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

    updData:any;
    uptData:any;
    auth_email: string;
    auth_token: string;
    auth_role: string;
    auth_roletype: string;
    auth_id: string;
    auth_user: any;
    auth_currency: any;
    organizationsetting: any;
    auth_language: any;
    auth_cloud_name: any;
    auth_cloud_name_new:any;
    auth_rtl: boolean;

    redirectUrl: string;
    currentUser: UserModel;

    constructor(
      private httpClient: HttpClient,
      private configuration: Configuration,
      private FormsService: FormsService
    ) {
      this.createdta();
    }

    public saleschannelteamByloginId (id: number) {
      return this.httpClient.get(this.configuration.actionUrl + 'auth/saleschannelteam/' + id)
    }

    public AsyncsaleschannelteamByloginId (id: number) {
      return this.httpClient.get(this.configuration.actionUrl + 'auth/saleschannelteam/' + id)
        .toPromise()
    }

    login(user: any) {

      localStorage.setItem('currentUser', JSON.stringify(user));          
      this.auth_email = user.username;
      this.auth_token = user.token;
      this.auth_role = user.role;
      this.auth_roletype = user.roletype;
      this.auth_id = user._id;
      this.auth_user = user.user;
      this.auth_currency = user.currency;
      this.organizationsetting = user.organizationsetting;
      this.auth_language = user.language;
      this.auth_cloud_name = user.cloud_name;
      this.auth_cloud_name_new = user.cloud_name;
      this.auth_rtl = user.rtl;
      
      this.configuration.headers.delete('authtoken');
      this.configuration.headers.delete('authkey');
      

      this.configuration.headers = this.configuration.headers.set('authtoken', user.token);
      this.configuration.headers = this.configuration.headers.set('authkey', user._id);

      this.FormsService
        .GetAll()
        .subscribe((data: any)=>{
          if(data) {
            localStorage.removeItem('forms');
            localStorage.setItem('forms', JSON.stringify(data));
          }
      })
    
    }

    isLoggedIn() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (this.currentUser) {
        return true;
      } else {
        return false;
      }
    }

    getLoginUser() {
      
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.auth_email = this.currentUser.username;
      this.auth_token = this.currentUser.token;
      this.auth_role = this.currentUser.role;
      this.auth_roletype = this.currentUser.roletype;
      this.auth_currency = this.currentUser.currency;
      this.organizationsetting = this.currentUser.organizationsetting;
      this.auth_language = this.currentUser.language;
      this.auth_cloud_name = this.currentUser.cloud_name;
      this.auth_cloud_name_new = this.currentUser.cloud_name;
      this.auth_rtl = this.currentUser.rtl;

      this.auth_id = this.currentUser._id;
      this.auth_user = this.currentUser.user;
      
      if(!this.configuration.headers.has('authtoken')) {
        this.configuration.headers.delete('authtoken');
        this.configuration.headers = this.configuration.headers.set('authtoken', this.currentUser.token);
      }

      if(!this.configuration.headers.has('authkey')) {
        this.configuration.headers.delete('authkey');
        this.configuration.headers = this.configuration.headers.set('authkey', this.currentUser._id);
      }
      return this.currentUser;
    }

    logout(): void {
      localStorage.clear();    
      this.auth_email = '';
      this.auth_token = '';
      this.auth_role = '';
      this.auth_id = '';
      this.auth_user = '';
      this.auth_currency = '';
      this.auth_language = '';
      this.auth_cloud_name = '';
      this.auth_cloud_name_new = '';
      this.auth_rtl = false;
    }

    public updtedta(tmpd: any) {

      if(tmpd == 'tsk')this.uptData.emit('tsk');
      if(tmpd == 'alrt')this.uptData.emit('alrt');
    }

    public ResetPassword (data: any) {
      const toAdd = JSON.stringify(data);
      return this.httpClient.post(this.configuration.actionUrl + 'auth/member/resetpassword', toAdd, { headers: this.configuration.headers })
    }

    public ResetUserPassword (data: any) {
      const toAdd = JSON.stringify(data);
      return this.httpClient.post(this.configuration.actionUrl + 'auth/user/resetpassword', toAdd, { headers: this.configuration.headers })
    }
    
    public  AsyncGetByPermission (data: any) {
      const toAdd = JSON.stringify(data);
      return this.httpClient.post(this.configuration.actionUrl + 'dispositionpermissions/permission', toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

    public async GetByPermissionAsync(data: any) {
      const toAdd = JSON.stringify(data);
      return this.httpClient.post(this.configuration.actionUrl + 'dispositionpermissions/permission', toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

    public createdta(){this.updData = new EventEmitter();this.uptData = new EventEmitter();}
  
}
