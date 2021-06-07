import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { BaseComponemntComponent } from '../shared/base-componemnt/base-componemnt.component';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FileSaverService } from "ngx-filesaver";


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

  checked: boolean = false;
  submitted: boolean = false;
  btnDisable: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();


  constructor(
    private _route: ActivatedRoute,
    private elementRef:ElementRef,
    private _FileSaverService: FileSaverService,
  ) { 
    super()

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formName = this.bindId;
    });
  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      try {
        await super.ngOnInit();
        await this.initializeVariables()
        await this.getformFields()
        await this.getLoadFormdatas()
        await this.getLoadForm()
      } catch (error) {
        console.error(error)
      }
    })
  }

  async initializeVariables() {
    this.selectedField = {};
    this.tempSlectedValue = {};
    this.formFieldVisibile = false;
    this.disableSubmitBtn = false;
    this.formfields = [];
    this.doctemplate = {};
    this.checked = false;
    this.submitted = false;
    this.btnDisable = false;
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
    //event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    this.formFieldVisibile = false;
    setTimeout(() => {
      this.selectedField = this.getformfieldObj(anchor.id)
      if(this.selectedField && this.selectedField.fieldtype == "datepicker") {
        var elems = document.getElementsByName("attributename_" + this.selectedField._id);
        for(var i = 0; i < elems.length; i++) {
          elems[i].setAttribute("style", "color: black;");
        }
      } else if(this.selectedField && this.selectedField.fieldtype !== "checkbox" && this.selectedField.fieldtype !== "text" && this.selectedField.fieldtype !== "list") {
        event.preventDefault();
        $("#myModalFormfieldPopup").click()
        this.formFieldVisibile = true;
      } else {

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

            if(this.tempSlectedValue && this.tempSlectedValue["property"] && this.tempSlectedValue["property"]["acknowledged"] ) {
              this.checked = true
            }

            if(this.tempSlectedValue && this.tempSlectedValue["property"] && this.tempSlectedValue["property"]["signed"] ) {
              this.submitted = true
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
                  htmlTemplate = "<input type='text' name='attributename_" + replace_str +"' id='" + replace_str +"' value='"+ value +"'>"
                } else if (formfieldObj.fieldtype == "checkbox") {

                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  if(formfieldObj.lookupdata && formfieldObj.lookupdata.length > 0) {
                    formfieldObj.lookupdata.forEach(element => {
                      var checkedString = '';
                      if(value && value.length > 0) {
                        var valueObj = value.find(p=>p == element.key);
                        if(valueObj)  checkedString = 'checked="checked"';
                      }
                      htmlTemplate += " <input type='checkbox' name='attributename_"+replace_str+"' id='" + replace_str +"' "+ checkedString +">"
                    });
                  }
                } else if (formfieldObj.fieldtype == "datepicker"){
                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';

                  htmlTemplate = "<input type='date' name='attributename_" + replace_str +"' id='" + replace_str +"' value='"+ th.convertDate(value) +"' style='" + th.getDayClassNames(value) +  "'>"


                } else if (formfieldObj.fieldtype == "lookup" || formfieldObj.fieldtype == "form") {
                  var value = formfieldObj && formfieldObj.value && formfieldObj.value.autocomplete_displayname ? formfieldObj.value.autocomplete_displayname : formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
                  htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
                } else if (formfieldObj.fieldtype == "signaturepad") {

                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  if(value == "") {
                    htmlTemplate = "<input type='text' id='" + replace_str +"' val='"+ value +"' placeholder='Signature ....' style='border: 0; border-bottom: 1px solid #000; height:100px; font-size:14pt;'>"
                  } else {
                    htmlTemplate = "<img id='" + replace_str +"' src='"+ value +"' style='height: 100px; width: 100px'>"
                  }


                } else if(formfieldObj.fieldtype == "list") {

                  var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
                  var checkedString = '';
                  var optionString = "";

                  optionString += "<option value=''></option>";

                  if(formfieldObj.lookupdata && formfieldObj.lookupdata.length > 0) {
                    formfieldObj.lookupdata.forEach(elementLookup => {
                      if(value == elementLookup.value) {
                        checkedString = "selected"
                      }
                      optionString += "<option value='"+ elementLookup.value +"' "+ checkedString +">"+ elementLookup.value +"</option>"
                    });
                  }

                  htmlTemplate = "<select name='attributename_" + replace_str +"' id='" + replace_str +"'> "+ optionString +" </select>"
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


                if(th.btnDisable) {
                  formcontrol = `<span id="${replace_str}">${htmlTemplate}</span>`;
                } else {
                  formcontrol = `<a id="${replace_str}">${htmlTemplate}</a>`;
                }

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

  async submit() {
    this.submitted = true;
    this.btnDisable = true;

    try {
      await this.manupluatingValues()
      await this.getLoadForm()
      await this.saveAsDraft();
    } catch (error) {
      console.log("error", error);
    }
  }

  async saveAsDraft() {

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

          this.tempSlectedValue["formid"] = this.formObj._id;

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

  async manupluatingValues() {
    this.formfields.forEach(element => {

      if(element.fieldtype == "text" || element.fieldtype == "list") {
        var elems = document.getElementsByName("attributename_" + element._id);
        for(var i = 0; i < elems.length; i++) {
          element.value = elems[i]["value"];
          this.tempSlectedValue['property'][element['fieldname']] = elems[i]["value"];;
        }
      } else if(element.fieldtype == "checkbox") {

        var elems = document.getElementsByName("attributename_" + element._id);
        for(var i = 0; i < elems.length; i++) {
          if(elems[i]["checked"] == true) {
            if(element.lookupdata && element.lookupdata.length > 0 && element.lookupdata[i] && element.lookupdata[i]["key"]) {
              if(!element.value) {
                element.value = [];
              }
              element.value.push(element.lookupdata[i]["key"]);
              if(!this.tempSlectedValue['property'][element['fieldname']]) {
                this.tempSlectedValue['property'][element['fieldname']] = [];
              }
              this.tempSlectedValue['property'][element['fieldname']].push(element.lookupdata[i]["key"]);
            }
          }
        }
      } else if(element.fieldtype == "datepicker") {
        var elems = document.getElementsByName("attributename_" + element._id);
        for(var i = 0; i < elems.length; i++) {
          if(elems[i]["value"] && elems[i]["value"] !== "") {
            var dateString = elems[i]["value"].split("-");
            if(dateString && dateString[2]) {
              var d = new Date();
              d.setFullYear(dateString[0]);
              d.setMonth(dateString[1] - 1);
              d.setDate(dateString[2]);
              element.value = d;
              this.tempSlectedValue['property'][element['fieldname']] = d;
            }
          }
        }
      }
    });
    return;
  }

  public onClickpdf() {

    this.btnDisable = true;
    let printContent = document.getElementById('printid').innerHTML;
    let postData = { 'document': printContent}
    this._commonService
      .generatepdf(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
          this._FileSaverService.save(data, "downloaded.pdf");
          this.btnDisable = false;
      });
  }

  getDayClassNames(value: any) {
    if(value == "") {
      return "color: transparent"
    } else {
      return "color: black";
    }
  }

}
