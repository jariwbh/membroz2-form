import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { BaseComponemntComponent } from '../shared/base-componemnt/base-componemnt.component';

declare const $: any;

@Component({
  selector: 'app-document-module',
  templateUrl: './document-module.component.html',
  styleUrls: ['./document-module.component.css']
})
export class DocumentModuleComponent extends BaseComponemntComponent implements OnInit {

  public anchors: any;

  selectedField: any;
  tempSlectedValue: any;
  formFieldVisibile: boolean = false;
  disableSubmitBtn: boolean = false;

  formfields: any [] = [];
  doctemplate: any;

  constructor(
    private _route: ActivatedRoute,
    private elementRef:ElementRef
  ) { 
    super()

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formName = this.bindId;
    });
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getformFields()
      await this.getLoadFormdatas()
      await this.getLoadForm()
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  async initializeVariables() {
    this.selectedField = {};
    this.tempSlectedValue = {};
    this.formFieldVisibile = false;
    this.disableSubmitBtn = false;
    this.formfields = [];
    this.doctemplate = {};
    return;
  }

  ngAfterViewChecked(){

    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick)
    })
  }

  public handleAnchorClick = (event: Event) => {
    // Prevent opening anchors the default way
    event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    this.formFieldVisibile = false;
    setTimeout(() => {
      this.selectedField = this.getformfieldObj(anchor.id)
      if(this.selectedField) {
        $("#myModalFormfieldPopup").click()
        this.formFieldVisibile = true;
      }  
    });
    
    
  }

  async getformFields() {

    var url = "formfields/filter";
    var method = "POST";
      
    let postData = {};
    postData['search'] = [];
    postData["search"].push({"searchfield": "formname", "searchvalue": this.formObj.formname, "criteria": "eq" });
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          this.formfields = [];
          this.formfields = data;
          this.tempSlectedValue = {}
          this.tempSlectedValue["property"] = {}
          this.formfields.forEach(element => {
            this.tempSlectedValue["property"][element.fieldname] = "";
          });
          return;
        }
        
    }, (error) =>{
      console.error(error);
    });
    
  }

  async getLoadFormdatas() {

    var url = "formdatas/filter";
    var method = "POST";
      
    let postData = {};
    postData['search'] = [];
    postData["search"].push({"searchfield": "formid", "searchvalue": this.formObj._id, "criteria": "eq", "datatype": "ObjectId"});
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          
          if(data && data[0]) {
            //this.tempSlectedValue = data[0];

            this.tempSlectedValue["addedby"] = data[0]["addedby"];
            this.tempSlectedValue["branchid"] = data[0]["branchid"];
            this.tempSlectedValue["createdAt"] = data[0]["createdAt"];
            this.tempSlectedValue["formid"] = data[0]["formid"];
            this.tempSlectedValue["status"] = data[0]["status"];
            this.tempSlectedValue["updatedAt"] = data[0]["updatedAt"];
            this.tempSlectedValue["_id"] = data[0]["_id"];

            if(this.tempSlectedValue && this.tempSlectedValue['property'] && this.formfields && this.formfields.length > 0) {
              this.formfields.forEach(element => {
                if(element && data[0]['property'][element.fieldname]) {
                  element.value = data[0]['property'][element.fieldname];
                  this.tempSlectedValue['property'][element.fieldname] = data[0]['property'][element.fieldname];
                }
              });
            }
          }
          return;
        }
        
    }, (error) =>{
      console.error(error);
    });
    
  }

  async getLoadForm() {

    var url = "forms/filter";
    var method = "POST";
      
    let postData = {};
    postData['search'] = [];
    postData["search"].push({"searchfield": "formname", "searchvalue": this.formObj.formname, "criteria": "eq"});
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {

          if(data && data[0] && data[0]["doctemplate"]) {

            this.doctemplate = data[0]["doctemplate"];

            var shortcode_regex_user = /\[\((\w+)+\.?(\w+)\.?(\w+)\)]/mg;
              var th_user: any = this;
              this.doctemplate.replace(shortcode_regex_user, function (match_user, code_user) {
              var replace_str_user = match_user.replace('[(', '');
              replace_str_user = replace_str_user.replace(')]', '');
              if(th_user._loginUser && th_user._loginUser[replace_str_user]) {
                var string_value = `<span style='background-color: yellow'>${th_user._loginUser[replace_str_user]}</span>`;
                th_user.doctemplate = th_user.doctemplate.replace("$[(" + replace_str_user + ")]", string_value);
              }
            });

            var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;

            var th: any = this;
            this.doctemplate.replace(shortcode_regex, function (match: any, code: any) {

              var replace_str = match.replace('[{', '');
              replace_str = replace_str.replace('}]', '');

              var formcontrol: any;

              var formfieldObj = th.getformfieldObj(replace_str)
              if(formfieldObj) {

                var textDisplay: any;
                var htmlTemplate = "";
                
                if(formfieldObj.fieldtype == "text") { 
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
                } else if (formfieldObj.fieldtype == "checkbox") {
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  if(formfieldObj.lookupdata && formfieldObj.lookupdata.length > 0) {
                    formfieldObj.lookupdata.forEach(element => {
                      var checkedString = '';
                      if(value && value.length > 0) {
                        var valueObj = value.find(p=>p == element.key);
                        if(valueObj)  checkedString = 'checked="checked"';
                      }
                      htmlTemplate += " <input type='checkbox' id='" + replace_str +"' "+ checkedString +">" 
                    });
                  }
                } else if (formfieldObj.fieldtype == "datepicker"){
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  
                  htmlTemplate = "<input type='date' id='" + replace_str +"' value='"+ th.convertDate(value) +"'>"
                } else if (formfieldObj.fieldtype == "lookup" || formfieldObj.fieldtype == "form") {
                  var value = formfieldObj && formfieldObj.value && formfieldObj.value.autocomplete_displayname ? formfieldObj.value.autocomplete_displayname : formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
                  htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
                } else if (formfieldObj.fieldtype == "signaturepad") {
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  htmlTemplate = "<img id='" + replace_str +"' src='"+ value +"' style='height: 100px; width: 100px'>"
                } else {
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
                }
                
                if(formfieldObj.fieldtype == "mobile" || formfieldObj.fieldtype == "alternatenumber" || formfieldObj.fieldtype == "whatsappnumber") {
                  textDisplay = formfieldObj && formfieldObj.value && formfieldObj.value.number ? formfieldObj.value.number : formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
                } else if (formfieldObj.fieldtype == "lookup" || formfieldObj.fieldtype == "form") {
                  textDisplay = formfieldObj && formfieldObj.value && formfieldObj.value.autocomplete_displayname ? formfieldObj.value.autocomplete_displayname : formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
                } else {
                  textDisplay = formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
                }
                formcontrol = `<a id="${replace_str}">${htmlTemplate}</a>`;
              }
              
              if (formcontrol) {
                th.doctemplate = th.doctemplate.replace("$[{" + replace_str + "}]", formcontrol);
              }

            });
          }
          return;
        }
    }, (error) =>{
      console.error(error);
    });
    
  }

  convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-')
  }

  getSubmittedData(submit_data: any) {

    if(submit_data) {

      if(this.tempSlectedValue && this.tempSlectedValue['property'] && this.tempSlectedValue['property'][this.selectedField['fieldname']] !== undefined)  {
        this.tempSlectedValue['property'][this.selectedField['fieldname']] = submit_data[this.selectedField['fieldname']];
      }

      var formfielObj = this.formfields.find(p=>p._id == this.selectedField._id)
      if(formfielObj) {
        formfielObj.value = submit_data[this.selectedField['fieldname']]
      }
      
      $(".close").click()
      this.getLoadForm()
      
    }
  }

  getformfieldObj(id: any) {
    return this.formfields.find(p=>p._id == id)
  }

  submit() {
    var isError: boolean = false;
    if(this.formfields && this.formfields.length > 0 ) {
      this.formfields.forEach(element => {
        if(element.required && (this.tempSlectedValue && this.tempSlectedValue['property'] && (this.tempSlectedValue['property'][this.selectedField.fieldname] == "") || (this.tempSlectedValue['property'][this.selectedField.fieldname] == null) )) {
          isError = true;
        }
      });
    }

    this.disableSubmitBtn = true;

    setTimeout(() => {
      if(isError) {
        this.disableSubmitBtn = false;
        this.showNotification('top', 'right', "Validation Failed !!!", 'danger');
      } else {

        if(this.tempSlectedValue && this.tempSlectedValue._id) {

          var url = "formdatas/" + this.tempSlectedValue._id;
          var method = "PUT";

          return this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, this.tempSlectedValue)
            .then( (data: any) => {
              if(data) {
                this.disableSubmitBtn = false;
                this.showNotification('top', 'right', "Document has been updated Successfully!!!", 'success');
                this.ngOnInit()
              }
          }, (error) =>{
            console.error(error);
            this.disableSubmitBtn = false;
          });

        } else {

          var url = "formdatas";
          var method = "POST";

          this.tempSlectedValue["formid"] = "602a087c99e17f373c5f4e7c";

          return this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, this.tempSlectedValue)
            .then( (data: any) => {
              if(data) {
                this.disableSubmitBtn = false;
                this.showNotification('top', 'right', "Document has been updated Successfully!!!", 'success');
                this.ngOnInit()
              }
          }, (error) =>{
            console.error(error);
            this.disableSubmitBtn = false;
          });
        }
        
    
      }
    });
  }

}
