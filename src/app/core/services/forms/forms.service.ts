import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Configuration } from './../../../app.constants';

@Injectable({
  providedIn: 'root'
})

export class FormsService {
  forms: any;


  constructor(
      private httpClient: HttpClient,
      private configuration: Configuration
  ) {
    this.forms = [];
        this.forms = JSON.parse(localStorage.getItem("forms"));
  }

  public GetAll () {
    
   if (!this.forms) {
      const toAdd = { "search": [] };
      return this.httpClient
        .post(this.configuration.actionUrl + "forms/filter", toAdd, {
          headers: this.configuration.headers,
        })
    } else {
      if (typeof localStorage.getItem("forms") !== 'undefined' && localStorage.getItem("forms") !== null) {
        this.forms = [];
        this.forms = JSON.parse(localStorage.getItem("forms"));
        var forms = [...this.forms];
        return of(this.forms).map((o) => o);
      } else {
        return of(this.forms).map((o) => o);
      }
      
    }
  };

  public AsyncGetAll (){
    if (!this.forms) {
      return this.httpClient
        .get(this.configuration.actionUrl + "forms", {
          headers: this.configuration.headers,
        })
        .toPromise();
    } else {

      if (typeof localStorage.getItem("forms") !== 'undefined' && localStorage.getItem("forms") !== null) {
        this.forms = [];
        this.forms = JSON.parse(localStorage.getItem("forms"));
        var forms = [...this.forms]
      } else {
        return Promise.resolve(this.forms)
      }
    }
    
    
  };

  public GetBySchema (schemaname: any) {
    return this.httpClient
      .get(this.configuration.actionUrl + "forms/schemas/" + schemaname, {
        headers: this.configuration.headers,
      })
  };

  public async GetByIdAsync(id: number){
    return this.httpClient
      .get(this.configuration.actionUrl + "forms/" + id, {
        headers: this.configuration.headers,
      })
      .toPromise();
  }

  public async GetByfilterAsync(data: any) {
    
    if(!this.forms) {
      const toAdd = JSON.stringify(data);
      return this.httpClient
        .post(this.configuration.actionUrl + "forms/filter", toAdd, {
          headers: this.configuration.headers,
        })
        .toPromise();
    } else {

      if (typeof localStorage.getItem("forms") !== 'undefined' && localStorage.getItem("forms") !== null) {
        this.forms = [];
        this.forms = JSON.parse(localStorage.getItem("forms"));
        var formData = [...this.forms];

        if(data.search.length !== 0) {

          var filter = {};
          var results = [];
  
          data.search.forEach(element => {
            filter[element.searchfield] = element.searchvalue;
          });
  
          results = formData.filter(function(item: any) {
            for (var key in filter) {
              if (item[key] === undefined || item[key] != filter[key])
                return false;
            }
            return true;
          });
  
          var forms = [...results]
          return Promise.resolve(forms)
        } else {
          return Promise.resolve(formData);
        }

      } else {
        return Promise.resolve(this.forms)
      }

      
      
      
    }
  }

  public GetByfilter (data: any) {
    
    if(!this.forms) {
      const toAdd = JSON.stringify(data);
      return this.httpClient
        .post(this.configuration.actionUrl + "forms/filter", toAdd, {
          headers: this.configuration.headers,
        })
    } else {

      


      if (typeof localStorage.getItem("forms") !== 'undefined' && localStorage.getItem("forms") !== null) {
        this.forms = [];
        this.forms = JSON.parse(localStorage.getItem("forms"));
        var formData = [...this.forms];

        if(data.search.length !== 0) {

          var filter = {};
          var results = [];
  
          data.search.forEach(element => {
            filter[element.searchfield] = element.searchvalue;
          });
  
          results = formData.filter(function(item: any) {
            for (var key in filter) {
              if (item[key] === undefined || item[key] != filter[key])
                return false;
            }
            return true;
          });
  
          var forms = [...results]
          
          return of(forms).map((o) => o);
        } else {
          
          return of(formData).map((o) => o);
        }

      } else {
        
        return of(this.forms).map((o) => o);
      }
    }
    
  };

  public GetByfilterView(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'forms/filter/view', toAdd, { headers: this.configuration.headers})
  }

  public AsyncGetByfilterView(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'forms/filter/view', toAdd, { headers: this.configuration.headers})
      .toPromise();
  }

  public GetById (id: number) {
    return this.httpClient
      .get(this.configuration.actionUrl + "forms/" + id, {
        headers: this.configuration.headers,
      })
  };

  public Add (data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "forms/", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public Update (id: number, data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .put(this.configuration.actionUrl + "forms/" + id, toAdd, {
        headers: this.configuration.headers,
      })
  };

  public Delete (id: number) {
    return this.httpClient
      .delete(this.configuration.actionUrl + "forms/" + id, {
        headers: this.configuration.headers,
      })
  };
}
