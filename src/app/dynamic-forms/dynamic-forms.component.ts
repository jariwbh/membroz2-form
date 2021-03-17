import { Observable } from "rxjs/Observable";
import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { FormsModel } from "../core/models/forms/forms.model";

import { CommonDataService } from "../core/services/common/common-data.service";

import { BaseComponemntComponent, BaseComponemntInterface } from "../shared/base-componemnt/base-componemnt.component";

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import swal from 'sweetalert2';
declare const $: any;

@Component({
  selector: 'app-dynamic-forms',
  templateUrl: './dynamic-forms.component.html',
  styles: [
  ]
})
export class DynamicFormsComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  forms: any [] = [];
    destroy$: Subject<boolean> = new Subject<boolean>();

    formsModel = new FormsModel();

    _sectionLists: any[] = [];

    bindIdData: any[] = [];


    _visibility: boolean = false;
    _defaultAllFields: any = {};
    _needToSave: any = {};

    isdirty = false;

    isEdit: boolean = false;
    isFilterListing: boolean = false;
    isdisablesavebutton = false;
    isLoadTabs = true;

    dispalyformname: any;

    contextid: any;
    onModel: any;
    addedby: any;

    constructor(
      private _route: ActivatedRoute,
      private _commonDataService: CommonDataService,
    ) {

      super();
      this._route.params.forEach((params) => {

        this._formId = params["formid"];
        this.addedby = params["addedby"];
        
        this.bindId = params["id"];
        this.contextid = params["contextid"];
        this.onModel = params["onModel"];
        this.pagename = this._formId;

      });
    }

    async ngOnInit() {
      this._route.params.forEach(async (params) => {
        await super.ngOnInit();
        try {
          await this.initializeComponent();
          if (this.bindId) {
            await this.getPersonDetailByID(this.bindId);
          }
          await this.LoadData();
          await this.getFormTypeDropdownValue();
        } catch(error) {
          console.error({ error });
        } finally {
          this._visibility = true;
          this.isdisablesavebutton = false;
        }
      })
    }

    Save() {}
    Update() {}
    Delete() {}
    ActionCall() {}

    ngOnDestroy() {
      this.destroy$.next(true);
      // Unsubscribe from the subject
      this.destroy$.unsubscribe();
    }

    async initializeComponent() {

      this.isFilterListing = false;
      if (this._commonDataService.isfilterDataForDynamicPages && this._commonDataService.filterDataForDynamicPagesparams) {
        this.isFilterListing = true;
        this._commonDataService.isfilterDataForDynamicPages = false;
      }

      this.formsModel = this.formObj;
      this.dispalyformname = this.formsModel && this.formsModel["langresources"] && this.formsModel["langresources"][this.defaultLanguage] ? this.formsModel["langresources"][this.defaultLanguage] : this.formsModel.dispalyformname ? this.formsModel.dispalyformname : this.formsModel.formname;
      if (this.bindId) {
        this.isEdit = true;
      }
      return;
    }

    async getPersonDetailByID(id: any) {

      var url = this.formsModel.geturl["url"].replace(":_id", "");
      var method = this.formsModel.geturl["method"];

      return this._commonService
        .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindId)
        .then((data: any) => {
          if (data) {
            this.bindIdData = data;
            this.viewVisibility = true;
            this.isLoadPermission = false;
            return;
          }
        }, (err) =>{
          console.error("err", err);
        });
    }

    async LoadData() {

      let postData = {};
      postData["search"] = [];
      postData["search"].push({searchfield: "formid", searchvalue: this._formId, criteria: "eq"});
      postData["sort"] = "formorder";

      var url = "formfields/filter";
      var method = "POST";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {

            console.log("data", data);

            if(data && data.length > 0) {

              this._defaultAllFields = {};

              for (var i = 0; i < data.length; i++) {
                this._defaultAllFields[data[i].fieldname] = null;
              }

              data.forEach((element) => {

                if (element.fieldtype == "slide_toggle" && !element.value) {
                  element.value = false;
                }

                if (this.bindId) {
                  for (let key in this.bindIdData["property"]) {
                    if (element.fieldname == key.toLowerCase()) {
                      if (element.fieldtype == "datepicker") {
                        if (this.bindIdData["property"][key] == null || this.bindIdData["property"][key] == "") {
                          element.value = null;
                        } else {
                          element.value = new Date(this.bindIdData["property"][key]);
                        }
                      } else {
                        element.value = this.bindIdData["property"][key];
                      }
                    }
                  }
                }
              });

              this._sectionLists = this.groupBy(data, "sectionname");

              if (this.formsModel && this.formsModel["rootfields"] && this.formsModel["rootfields"].length > 0) {

                this.formsModel["rootfields"].forEach((element) => {
                  let fieldname = element["fieldname"];
                  this._defaultAllFields[fieldname] = null;

                  element["sectionname"] = this._sectionLists[0]["sectionname"];
                  element["sectiondisplaytext"] = this._sectionLists[0]["sectiondisplaytext"];


                  if (this.bindId && element["fieldname"]) {
                    let fieldname = element["fieldname"];
                    if (element["fieldtype"] == "datepicker") {
                      element["value"] = new Date(this.bindIdData["property"][fieldname]);
                    } else if (element["fieldtype"] == "form_multiselect") {
                      if (this.bindIdData[fieldname].length != 0) {
                        if (element["value"] != []) {
                          element["value"] = [];
                        }
                        let formfield = element["formfield"];
                        let displayvalue = element["displayvalue"];
                        this.bindIdData[fieldname].forEach((multiselectEle) => {
                          let obj = { id: multiselectEle[formfield], itemName: multiselectEle[displayvalue]};
                          element["value"].push(obj);
                        });
                      }
                    } else {
                      if (!this.bindIdData["property"]) {
                        if (typeof this.bindIdData[fieldname] === "object" && this.bindIdData[fieldname]["_id"]) {
                          element["value"] = this.bindIdData[fieldname]["_id"];
                        } else {
                          element["value"] = this.bindIdData[fieldname];
                        }
                      } else {
                        if (typeof this.bindIdData["property"][fieldname] === "object" && this.bindIdData["property"][fieldname] && this.bindIdData["property"][fieldname]["_id"]) {
                          element["value"] = this.bindIdData["property"][fieldname]["_id"];
                        } else {
                          element["value"] = this.bindIdData["property"][fieldname];
                        }
                      }
                    }
                  }

                  this._sectionLists[0].unshift(element);
                });
              }

            }
          }
        }, (err) =>{
          console.error("err", err);
        });
    }

    async getFormTypeDropdownValue() {

      this._sectionLists.forEach((element) => {
        if (element.fieldtype == "form_multiselect") {

          element.readonly = false;

          let postData = {};
          postData["search"] = [];
          if (element["fieldfilter"]) {
            let res = element["fieldfilter"].split(".");
            if (res[0]) {
              element["fieldfilter"] = res[0];
            }
            postData["search"].push({searchfield: element["fieldfilter"], searchvalue: element["fieldfiltervalue"], criteria: element["criteria"] ? element["criteria"] : "eq"});
            postData["select"] = [];
            postData["select"].push({fieldname: element["formfield"], value: 1});
            postData["select"].push({fieldname: element["displayvalue"],  value: 1});
            postData["sort"] = element["displayvalue"];
          }

          element.formfieldfilterValue = [];
          let url = element["apiurl"];
          let method = element["method"];

          this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              if (data) {

                if (data.length !== 0) {
                  data.forEach((ele) => {
                    let val: any;
                    let displayvalue: any;
                    if (element["displayvalue"].indexOf(".") !== -1) {
                      let stringValue = element["displayvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      val = ele[str1][str2];
                    } else {
                      displayvalue = element["displayvalue"];
                      val = ele[displayvalue];
                    }

                    let formfield = element["formfield"];
                    let key = ele[formfield];
                    let obj = { id: key, itemName: val};
                    element.formfieldfilterValue.push(obj);

                  });
                }
              }
            }, (err) =>{
              console.error("err", err);
            });
        }
      });
      return;

    }

    groupBy(collection: any, property: any) {
      let i = 0, val, index, values = [], result = [];
      for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1) {
          result[index].push(collection[i]);
        } else {
          values.push(val);
          result.push([collection[i]]);
        }
      }
      return result;
    }

    getSubmittedData(submit_data: any) {
      // if (this.bindId && !this.editPermission) {
      //   this.noeditpermissionMsg("edit");
      //   this.isdisablesavebutton = false;
      //   return;
      // } else if (!this.bindId && !this.addPermission) {
      //   this.noeditpermissionMsg("add");
      //   this.isdisablesavebutton = false;
      //   return;
      // }

      if (this.bindId) {

        let url = this.formsModel.editurl["url"].replace(":_id", "");
        let method = this.formsModel.editurl["method"];

        for (let submitKey in submit_data) {
          if (!this.bindIdData["property"][submitKey]) {
            this.bindIdData["property"][submitKey] = null;
          }

          for (let key in this.bindIdData["property"]) {
            if (key == submitKey.toLowerCase()) {
              this.bindIdData["property"][key] = submit_data[submitKey];
            }
          }
        }

        if (this.formsModel) {
          if (this.formsModel["rootfields"]) {
            this.formsModel["rootfields"].forEach((element) => {
              for (let key in this.bindIdData["property"]) {
                if (element["fieldname"] == key) {
                  this.bindIdData[key] = this.bindIdData["property"][key];
                }
              }
            });
          }
        }

        if (this.isFilterListing && this._commonDataService.filterDataForDynamicPagesparams["search"]) {
          if (this._commonDataService.filterDataForDynamicPagesparams["search"][0]) {
            this.bindIdData[this._commonDataService.filterDataForDynamicPagesparams["search"][0]["searchfield"]] = this._commonDataService.filterDataForDynamicPagesparams["search"][0]["searchvalue"];
          }
        }

        this.updateRecord(url, method);


      } else {
        this._needToSave["property"] = this._defaultAllFields;
        setTimeout(() => {

          for (let submitKey in submit_data) {

            if (!this._needToSave["property"][submitKey]) {
              this._needToSave["property"][submitKey] = null;
            }

            for (let key in this._needToSave["property"]) {
              if (key == submitKey.toLowerCase()) {
                this._needToSave["property"][key] = submit_data[submitKey];
              }
            }
          }
          let url = this.formsModel.addurl["url"];
          let method = this.formsModel.addurl["method"];
          for (let key in this._needToSave["property"]) {
            if (Object.prototype.toString.call(this._needToSave["property"][key]) === "[object Array]") {
              for (let k in this._needToSave["property"][key]) {
                if (typeof this._needToSave["property"][key][k] == "undefined") {
                  this._needToSave["property"][key][k] = null;
                }
              }
            } else {
              if (typeof this._needToSave["property"][key] == "undefined") {
                this._needToSave["property"][key] = null;
              }
            }
          }
          if (this.formsModel && this.formsModel["rootfields"]) {
            this.formsModel["rootfields"].forEach((element) => {
              for (let key in this._needToSave["property"]) {
                if (element["fieldname"] == key) {
                  this._needToSave[key] = this._needToSave["property"][key];
                }
              }
            });
          }
          if (this.isFilterListing && this._commonDataService.filterDataForDynamicPagesparams["search"] && this._commonDataService.filterDataForDynamicPagesparams["search"][0]) {
            this._needToSave[this._commonDataService.filterDataForDynamicPagesparams["search"][0]["searchfield"]] = this._commonDataService.filterDataForDynamicPagesparams["search"][0]["searchvalue"];
          }
          if(url == "formdatas") {
            this._needToSave["formid"] = this._formId;
            this._needToSave["contextid"] = this.contextid;
            this._needToSave["onModel"] = this.onModel;
          }
          this.addRecord(url, method)
        }, 1000);
      }
    }

    addRecord(url: any, method: any) {
      console.log("addRecord called", )
      this.isdisablesavebutton = true;

      console.log("url", url);
      console.log("method", method);
      console.log("_needToSave", this._needToSave);

      if(this.addedby) {
        if(!this._needToSave['addedby']) {
          this._needToSave['addedby'] = "";
        }
        this._needToSave['addedby'] = this.addedby;
      }

      console.log("_needToSave", this._needToSave);

      this._commonService
        .commonServiceByUrlMethodData(url, method, this._needToSave)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data: any) => {
            console.log("data", data);
            this.isdirty = false;
            this.isdisablesavebutton = false;
            this.showNotification("top", "right", this.jsUcfirst(this.dispalyformname) + " has been added successfully!!!", "success");
            //this.redirect();
            this._router.navigate(["success"]);
          },
          (err) => {
            var body = err.error;
            this.isdisablesavebutton = false;
            if (err.status == 500) {
              this.showNotification("top", "right", body.message, "danger");
            }
      });
    }

    updateRecord(url: any, method: any) {

      this.isdisablesavebutton = true;
      this._commonService
        .commonServiceByUrlMethodData(url, method, this.bindIdData, this.bindId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.isdirty = false;
          this.isdisablesavebutton = false;
          this.showNotification("top", "right", this.jsUcfirst(this.dispalyformname) + " has been updated successfully!!!", "success");
          this.redirect();
        },
        (err) => {
          var body = err.error;
          this.isdisablesavebutton = false;
          if (err.status == 500) {
            this.showNotification("top", "right", body.message, "danger");
          }
        }
      );
    }

    redirect() {

      if (this.isFilterListing && this._commonDataService.filterDataForDynamicPagesparams["returnURl"] !== "" ) {
        var redirectUrl = this._commonDataService.filterDataForDynamicPagesparams["returnURl"];
        this._commonDataService.isfilterDataForDynamicPages = false;
        this._commonDataService.filterDataForDynamicPagesparams["returnURl"] = "";
        this._router.navigate([redirectUrl]);
      } else {
        this._router.navigate(["pages/dynamic-list/list/" + this.formsModel.formname]);
      }
    }

    noeditpermissionMsg(mode: any) {

      swal.fire({
        title: "No Permission",
        text: "You have no " + mode + " permission for this form.",
        timer: 2000,
        showConfirmButton: false
      });

    }

    jsUcfirst(string: any) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    comparer(otherArray: any) {
      return function (current: any) {
        return (
          otherArray.filter(function (other: any) {
            return (
              other.value == current.value && other.display == current.display
            );
          }).length == 0
        );
      };
    }

    disabledDirtyData(submit_data: any) {
      this.isdirty = false;
      this._router.navigate(submit_data);
    }

}
