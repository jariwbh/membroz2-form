
import { Component, OnInit } from "@angular/core";
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from "@angular/router";

import { AppInjector } from "../../../app-injector.service";

import { AuthService } from "./../../../core/services/common/auth.service";
import { SafeHtml } from '@angular/platform-browser';

import { CommonService } from "../../../core/services/common/common.service";

import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';

declare var $: any;

@Component({
  selector: 'app-base-lite-componemnt',
  templateUrl: './base-lite-componemnt.component.html'
})
export class BaseLiteComponemntComponent implements OnInit {

  protected _authService: AuthService;

  protected _loginUser: any;
  protected _loginUserId: any;
  protected _loginUserRole: any;
  protected _loginUserRoleId: any;
  protected _loginUserMembershipId: any;
  protected _loginUserClassId: any;
  protected _loginUserBranchId: any;
  protected _loginUserBranch: any;
  protected _loginUserRoleName: any;
  protected _loginroletype: any;

  protected _organizationsetting: any;

  protected _router: Router;
  protected snackBar: MatSnackBar;
  protected _commonService: CommonService;

  public langResource: any;
  public defaultLanguage: any;
  public pagename: any;
  public gDateFormat: any = "MM/dd/yyyy";

  previousObservableUrl: Observable<string>;
  previousUrl: string;

  constructor(
  ) {
    const injector = AppInjector.getInjector();
    this._authService = injector.get(AuthService);
    this._router = injector.get(Router);
    this._commonService = injector.get(CommonService);
  }

  async ngOnInit() {

    this.defaultLanguage = "ENG";
    this.defaultLanguage = this._authService.auth_language;
    this.langResource = {};

    this.initialize(); // LOGIN VARIABLES

    try {
      if (this.pagename) {
        await this.loadLangResource(this.pagename); // INITIALIZE LANG VARIABLE
      }
    } catch (error) {
      console.error({ error });
    } finally {
      // console.log("4...");
    }

  }


  // LOGIN VARIABLES
  initialize() {
    if (this._authService && this._authService.currentUser) {

      this._loginUserId = this._authService.currentUser._id;
      this._loginUser = this._authService.currentUser.user;
      this._loginUserRole = this._authService.auth_role;
      this._loginUserRoleId = this._authService && this._authService.auth_role && this._authService.auth_role['_id'] ? this._authService.auth_role['_id'] : null;
      this._loginUserRoleName = this._authService.currentUser.user.role.rolename;
      this._organizationsetting = this._authService.organizationsetting;
      this._loginroletype = this._authService && this._authService.auth_role && this._authService.auth_role["roletype"] ? this._authService.auth_role["roletype"] : null;
      
      if (this._authService.auth_user) {
        if (this._authService.auth_role["roletype"] == "M") {
          if (this._authService.auth_user.membershipid) {
            this._loginUserMembershipId = this._authService.auth_user.membershipid[
              "_id"
            ];
          }
          if (this._authService.auth_user.classid) {
            this._loginUserClassId = this._authService.auth_user.classid;
          }
        }
      }

      if (
        this._authService &&
        this._authService.auth_user &&
        this._authService.auth_user.branchid &&
        this._authService.auth_user.branchid._id
      ) {
        this._loginUserBranchId = this._authService.auth_user.branchid._id;
        this._loginUserBranch = this._authService.auth_user.branchid;
      }
    }
  }

  async loadLangResource(pageName: any) {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "componentname", searchvalue: pageName, datatype: "text", criteria: "eq" });
    postData["search"].push({ searchfield: "key", searchvalue: true, datatype: "Boolean", criteria: "exists" });

    var url = "langresources/filter";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data) => {
        if (data && Array.isArray(data) && data.length !== 0) {
          this.langResource = {};
          data.forEach((element) => {
            if (element.key && element.value) {
              this.langResource[element.key] = [];
              this.langResource[element.key] = element["value"][this.defaultLanguage] ? element["value"][this.defaultLanguage] : element.key;
            }
          });
        }
      });
  }

  public getLang(key: string, value: string) {
    return this.langResource[key] ? this.langResource[key] : value;
  }


  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.name}  </span>`;
    return html;
  }


  showNotification(from: any, align: any, msg: any, type: any) {
    $.notify(
      {
        icon: "notifications",
        message: msg,
      },
      {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackBar.open(message, action, {
      duration: 1000,
      panelClass: [className]
    });
  }


}
