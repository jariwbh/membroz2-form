import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import {OrgnizationsettingService} from './core/services/public/orgnizationsetting.service'

@Injectable()
export class Configuration {

  public Server: string;
  public actionUrl: string;
  public redirectUrl: string;
  public headers: HttpHeaders = new HttpHeaders();

  public serverBaseUrl: '';
  public baseUrl: string;


  constructor(
    private route: ActivatedRoute,
    private orgnizationsettingService: OrgnizationsettingService
  ) {

    this.headers = this.headers.set('Content-Type', 'application/json');
    this.headers = this.headers.set('Accept', 'application/json');
    this.headers = this.headers.set('Access-Control-Allow-Origin', '*');

    this.baseUrl = location.origin + '/#';

    this.route.queryParams.subscribe(params => {
            
      console.log("contasnt params", params);

      if(params['domain'] && params['https']) {
          
          var protocolStr = "http";
          if ( params['https'] &&  params['https'] == "true") {
              protocolStr = "https";
          }

          this.Server = protocolStr + '://' + params['domain'] + '/';
          this.actionUrl = this.Server + 'api/';

      } else {
            this.Server = 'http://app.membroz.com/';
            this.actionUrl = this.Server + 'api/';
            // this.Server = 'http://localhost:3001/';
            // this.actionUrl = this.Server + 'api/';
          
      }

      
      this.orgnizationsettingService
          .GetBySetting(this.actionUrl, this.headers)
          .subscribe(data => {
              if (data) {

                  console.log("orgnizationsettingService data", data);

                  if (data[0] && data[0].memberportal && data[0].memberportal.authkey) {
                      //this.headers.append('authkey', data[0].memberportal.authkey);
                      this.headers = this.headers.set('authkey', data[0].memberportal.authkey);
                  }

                  if (data[0] && data[0].memberportal && data[0].memberportal.redirecturl) {
                      this.redirectUrl = data[0].memberportal.redirecturl;
                  }
              } 
          });

  });

  }
}
