import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
   } from '@angular/common/http';
   import { throwError } from 'rxjs';
   import { Observable } from 'rxjs/Observable';
   import { retry, catchError } from 'rxjs/operators';


   export class HttpErrorInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // check to see if there's internet
        if (!window.navigator.onLine) {
            // if there is no internet, throw a HttpErrorResponse error
            // since an error is thrown, the function will terminate here
            let errorMessage = 'Internet is required.';
            window.alert(errorMessage);
            return throwError(new HttpErrorResponse({ error: errorMessage }));

        } else {
            // else return the normal request
            return next.handle(request)
                .pipe(
                    retry(1),
                    catchError((error: HttpErrorResponse) => {
                        let errorMessage = '';
                        if (error.error instanceof ErrorEvent) {
                            // client-side error
                            errorMessage = `Error: ${error.error.message}`;
                        } else {
                            // server-side error
                            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                        }
                        //window.alert(errorMessage);
                        return throwError(error);
                    })
                )
        }
    }
   }
