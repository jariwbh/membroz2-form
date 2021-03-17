import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  constructor(
    private httpClient: HttpClient,
    private configuration: Configuration
  ) {

  }

  public GetAll() {
    return this.httpClient
      .get(this.configuration.actionUrl + 'formfields', { headers: this.configuration.headers })
  }

  public GetByCollection(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public GetByCollectionClone(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/clone", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public GetByCollectionDistinct(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/distinct", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public templatetodoc(data: any) {
    const toAdd = JSON.stringify(data);

    return this.httpClient
      .post(this.configuration.actionUrl + "common/templatetodoc", toAdd, {
        headers: this.configuration.headers,
        responseType: 'blob',
      })
  };

  public validobject(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/validobject", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public distinctbyschema(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/distinctbyschema", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public commonServiceByUrlMethodIdOrDataAsync(url: string, method: string, id?: string, data?: any) {
    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != "") {
        urlstring = urlstring + id;
      }
      if (method != "") {
        if (method == "GET") {
          return this.httpClient
            .get(urlstring, { headers: this.configuration.headers })
            .toPromise();
        } else if (method == "GET" && (data != null || "")) {

          const toAdd = JSON.stringify(data);
          return this.httpClient
            .get(urlstring)
            .toPromise();

        } else if (method == "DELETE" && (id != null || "")) {
          if (data !== undefined && data.formname !== undefined) {
            if (!this.configuration.headers.has("formname")) {
              this.configuration.headers.append("formname", data.formname);
            }
          }
          return this.httpClient
            .delete(urlstring, { headers: this.configuration.headers })
            .toPromise();
        }
      } else {
        return this.httpClient
          .get(urlstring, { headers: this.configuration.headers })
          .toPromise();
      }
    }
  }

  public commonServiceByUrlMethodIdOrData(url: string, method: string, id?: string, data?: any) {
    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != "") {
        urlstring = urlstring + id;
      }
      if (method != "") {
        if (method == "GET") {
          return this.httpClient
            .get(urlstring, { headers: this.configuration.headers })
        } else if (method == "GET" && (data != null || "")) {

          const toAdd = JSON.stringify(data);
          return this.httpClient
            .get(urlstring)

        } else if (method == "DELETE" && (id != null || "")) {
          if (data !== undefined && data.formname !== undefined) {
            if (!this.configuration.headers.has("formname")) {
              this.configuration.headers.append("formname", data.formname);
            }
          }
          return this.httpClient
            .delete(urlstring, { headers: this.configuration.headers })
        }
      } else {
        return this.httpClient
          .get(urlstring, { headers: this.configuration.headers })
      }
    }
  }

  public commonServiceByUrlMethodData(url: string, method: string, data: any, id?: string) {

    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != undefined && id != "") {
        urlstring = urlstring + "/" + id;
      }
      if (method != "") {

        if (method == "POST" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .post(urlstring, toAdd, { headers: this.configuration.headers })
        } else if (method == "PATCH" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .patch(urlstring, toAdd, { headers: this.configuration.headers })
        } else if (method == "PUT" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .put(urlstring, toAdd, { headers: this.configuration.headers })
        } else if (method == "GET" && (data != null || "")) {
          return this.httpClient
            .get(urlstring, { headers: this.configuration.headers })
        }
      } else {
        const toAdd = JSON.stringify(data);
        return this.httpClient
          .post(urlstring, toAdd, { headers: this.configuration.headers })
      }
    }
  }

  public commonServiceByUrlMethodDataAsync(url: string, method: string, data: any, id?: string) {

    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != undefined && id != "") {
        urlstring = urlstring + "/" + id;
      }
      if (method != "") {

        if (method == "POST" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .post(urlstring, toAdd, { headers: this.configuration.headers })
            .toPromise();
        } else if (method == "PUT" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .put(urlstring, toAdd, { headers: this.configuration.headers })
            .toPromise();
        } else if (method == "PATCH" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .patch(urlstring, toAdd, { headers: this.configuration.headers })
            .toPromise();
        } else if (method == "GET" && (data != null || "")) {
          return this.httpClient
            .get(urlstring, { headers: this.configuration.headers })
            .toPromise();
        }
      } else {
        const toAdd = JSON.stringify(data);
        return this.httpClient
          .post(urlstring, toAdd, { headers: this.configuration.headers })
          .toPromise();
      }
    }
  }

  public commonServiceByUrlMethodDataPagination(url: string, method: string, data: any, id?: string) {

    
    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != undefined && id != "") {
        urlstring = urlstring + "/" + id;
      }
      if (method != "") {

        if (method == "POST" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .post(urlstring, toAdd, { observe: "response", headers: this.configuration.headers })
            .toPromise();
        } else if (method == "PUT" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .put(urlstring, toAdd, { observe: "response", headers: this.configuration.headers })
            .toPromise();
        } else if (method == "GET" && (data != null || "")) {
          return this.httpClient
            .get(urlstring, { observe: "response", headers: this.configuration.headers })
            .toPromise();
        }
      } else {
        const toAdd = JSON.stringify(data);
        return this.httpClient
          .post(urlstring, toAdd, { observe: "response", headers: this.configuration.headers })
          .toPromise();
      }
    }
  }

  public commonServiceByUrlMethodDataExpo(
    url: string,
    method: string,
    data: any,
    id?: string
  ) {
    let urlstring = this.configuration.actionUrl;
    if (url != "") {
      urlstring = urlstring + url;
      if (id != undefined && id != "") {
        urlstring = urlstring + "/" + id;
      }
      if (method != "") {
        if (method == "POST" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .post(urlstring, toAdd, {
              headers: this.configuration.headers,
              responseType: 'blob',
            })
        } else if (method == "PUT" && (data != undefined || null)) {
          const toAdd = JSON.stringify(data);
          return this.httpClient
            .put(urlstring, toAdd, {
              headers: this.configuration.headers,
              responseType: 'blob',
            })
        }
      } else {
        const toAdd = JSON.stringify(data);
        return this.httpClient
          .post(urlstring, toAdd, {
            headers: this.configuration.headers,
            responseType: 'blob',
          })
      }
    }
  };

  public convertToCSV(data: any) {
    const toAdd = JSON.stringify(data);

    return this.httpClient
      .post(this.configuration.actionUrl + "common/exporttocsv", toAdd, {
        headers: this.configuration.headers,
        responseType: 'blob',
      })
  };

  public convertToPDF(data: any) {
    const toAdd = JSON.stringify(data);

    return this.httpClient
      .post(this.configuration.actionUrl + "common/exporttopdf", toAdd, {
        headers: this.configuration.headers,
        responseType: 'blob',
      })
  };

  public Getdynamicfieldsbyformane(
    formname: any,
    type: any
  ) {
    console.log("api", this.configuration.actionUrl +
      "common/formfields/" +
      formname +
      "/" +
      type)
    return this.httpClient
      .get(
        this.configuration.actionUrl +
        "common/formfields/" +
        formname +
        "/" +
        type,
        { headers: this.configuration.headers }
      )
  };

  public Getschemasbyschemasformane(
    formname: any,
    schemas: any
  ) {
    return this.httpClient
      .get(this.configuration.actionUrl + schemas + "/schemas/" + formname, {
        headers: this.configuration.headers,
      })
  };

  public Getreffieldsbyforname(formname: any) {
    return this.httpClient
      .get(this.configuration.actionUrl + "common/formname/" + formname, {
        headers: this.configuration.headers,
      })
  };

  public summaryToCSV(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/generatecsv", toAdd, {
        headers: this.configuration.headers,
        responseType: 'blob',
      })
  };

  public AsyncContactsFilter(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + "common/contacts/filter", toAdd, { headers: this.configuration.headers })
      .toPromise();
  }

  public ContactsFilter(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + "common/contacts/filter", toAdd, { headers: this.configuration.headers });
  }

  public searchcontacts(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/searchcontacts", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public calTaxes = (taxes?: any, amount?: any): any => {

    var taxrate = 0;
    var perAmount = 0;

    if (taxes) {
      taxes.forEach((tax) => {
        taxrate += tax.amount;
        if (amount != undefined) {
          perAmount += (Math.round(tax.amount) * parseInt(amount)) / 100;
        }
      });
    } else {

      taxrate = undefined;
      perAmount = undefined;
    }

    if (amount != undefined) {
      return perAmount;
    } else {
      return taxrate;
    }
  };

  public getmailcontent(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/mailcontent", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public generatepdf(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/generatepdf", toAdd, {
        headers: this.configuration.headers,
        responseType: 'blob',
      })
  };

  public updatestatus(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/updatestatus", toAdd, { headers: this.configuration.headers })
  };

  public updatewfstatus(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "common/updatewfstatus", toAdd, { headers: this.configuration.headers })
      .toPromise();
  };

  public AsyncFormListByfilter(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + 'formlists/filter', toAdd, { headers: this.configuration.headers })
      .toPromise()
  }

  public AsyncGetFormSchemaByFormName(formName: any) {
    return this.httpClient
      .get(this.configuration.actionUrl + 'common/schemas/' + formName, { headers: this.configuration.headers })
      .toPromise()
  }

  public communicationsend(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + 'communications/send', toAdd, { headers: this.configuration.headers })
      .toPromise()
  }

}