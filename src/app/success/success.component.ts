import { Component, OnInit } from '@angular/core';
import { Configuration } from '../app.constants';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styles: [
  ]
})
export class SuccessComponent implements OnInit {

  redirect: any;
  constructor(
    private configuration: Configuration
  ) { }

  ngOnInit(): void {
    console.log("redirectUrl", this.configuration.redirectUrl);
    if(this.configuration.redirectUrl) {
      this.redirect = this.configuration.redirectUrl;
    }
  }

}
