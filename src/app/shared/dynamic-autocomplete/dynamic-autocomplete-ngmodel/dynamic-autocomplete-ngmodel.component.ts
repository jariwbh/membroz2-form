import { Component, ChangeDetectorRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../../core/services/common/common.service';

import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-autocomplete-ngmodel',
  templateUrl: './dynamic-autocomplete-ngmodel.component.html'
})
export class DynamicAutocompleteNgmodelComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  myControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<string[]>;

  isLoadingBox: boolean = false;

  counter = 0;

  constructor(
    private _commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {

  }

  @Input() dbvalue: any;
  @Input() inputModel: any;
  @Input() setting: any;
  @Output() inputModelChange = new EventEmitter<string>();


  ngOnInit() {

    this.loadData();

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.autocomplete_displayname),
        map(option => option ? this.filter(option) : this.options.slice())
      );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
  }

  preloaddata() {
    if (this.options.length == 0) {
      if (this.setting && this.setting.fieldtype == "form") {
        this.formData()
      } else if (this.setting && this.setting.fieldtype == "lookup") {
        this.lookupData()
      } else if (this.setting && this.setting.fieldtype == "formdata")  {
        this.formdataData()
      } else if (this.setting && (this.setting.fieldtype == "ObjectID" || this.setting.fieldtype == "ObjectId")) {
        this.ObjectidData()
      }
    }
  }

  loadData() {

    if (this.setting && this.setting.fieldtype == "form") {
      if (localStorage.getItem("form") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("form")) || {};
        if (oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
        }
      } 
      this.filldata()
      this.loadForms()
    } else if (this.setting && this.setting.fieldtype == "lookup") {
      if (localStorage.getItem("lookup") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("lookup")) || {};
        if (oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
        }
      } 
      this.filldata()
      this.loadLookup()
    } else if (this.setting && this.setting.fieldtype == "formdata")  {

      if (localStorage.getItem("formdata") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("formdata")) || {};
        if (oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
        }
      }
      this.filldata()
      this.loadFormdata()
    } else if (this.setting && ( this.setting.fieldtype == "ObjectID" || this.setting.fieldtype == "ObjectId" )) {
      if (localStorage.getItem("objectid") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("objectid")) || {};
        if (oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
        }
      }
      this.filldata()
      this.loadObjectId()
    }
  }

  loadObjectId() {

    this.myControl
      .valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        switchMap((value) => {

          this.isLoadingBox = true;

          if (this.options.length > 0) {
            return of(this.options);
          } else {

            let refcollection: any;
            let reffieldname: any;
            let refschema: any;
            refcollection = this.setting.option.ref;
            refschema = this.setting.option.refschema;
            reffieldname = this.setting.option.reffieldname;
            let postData = {};
            postData['refcollection'] = refcollection;
            postData['refschema'] = refschema;
            postData['refselect'] = reffieldname;

            return this._commonService
              .GetByCollection(postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData) => {

                  var cnt = 0;
                  for (var i in responseData[0]) {
                    if (cnt == 1) {
                      this.setting.refkey = i;
                    }
                    cnt++;
                  }

                  const postsArray = [];
                  for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                      responseData[key]['autocomplete_id'] = responseData[key]._id;
                      responseData[key]['autocomplete_displayname'] = responseData[key][this.setting.refkey];
                      postsArray.push(responseData[key]);
                    }
                  }
                  this.localStore('objectid', { [this.setting["fieldname"]]: postsArray });
                  return postsArray;
                })
              )
          }
        })
      ).subscribe((data: any) => {
        this.options = [];
        this.options = data;
        this.isLoadingBox = false;
        this.filldata();
      });


    
      
  }

  loadLookup() {

    this.myControl
      .valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        switchMap((value) => {


          this.isLoadingBox = true;

          if (this.options.length > 0) {
            return of(this.options);
          } else {

            let postData = {};
            postData["search"] = [];
            postData["select"] = [];

            if (this.setting && this.setting["search"]) {
              postData["search"] = this.setting["search"];
            } else {
              var lookupid = this.setting.lookupid ? this.setting.lookupid : this.setting.lookupfieldid
              postData["search"].push({ searchfield: "_id", searchvalue: lookupid, criteria: "eq" });
            }

            if (this.setting && this.setting["select"]) {
              postData["select"] = this.setting["select"];
            } else {
              postData["select"].push({ fieldname: "_id", value: 1 });
              postData["select"].push({ fieldname: "data", value: 1 });
            }

            var url = "lookups/filter";
            var method = "POST";
    
            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData) => {
                  const postsArray = [];
                  for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                      if (responseData[key]["data"] && responseData[key]["data"].length !== 0) {
                        responseData[key]["data"].forEach((ele) => {
                          ele['autocomplete_id'] = ele.code;
                          ele['autocomplete_displayname'] = ele.name;
                          postsArray.push(ele);
                        });
                      }
                    }
                  }
                  this.localStore('lookup', { [this.setting["fieldname"]]: postsArray });
                  return postsArray;
                })
              )
          }
        })
      ).subscribe((data: any) => {
        this.options = [];
        this.options = data;
        this.isLoadingBox = false;
        this.filldata();
      });
  }

  loadForms() {
    this.myControl
      .valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        switchMap((value) => {

          this.isLoadingBox = true;
          if (this.options.length > 0) {
            return of(this.options);
          } else {

            let postData = {};
            postData["search"] = [];
            postData["select"] = [];

            if (this.setting && this.setting["search"]) {
              postData["search"] = this.setting['search'];
            } else {
              if (this.setting["form"]["fieldfilter"]) {
                let res = this.setting["form"]["fieldfilter"].split(".");
                if (res[0]) {
                  this.setting["form"]["fieldfilter"] = res[0];
                }
                postData["search"].push({ searchfield: this.setting["form"]["fieldfilter"], searchvalue: this.setting["form"]["fieldfiltervalue"], criteria: this.setting["criteria"] ? this.setting["criteria"] : "eq" });
              }
            }

            if (this.setting && this.setting["select"]) {
              postData["select"] = this.setting['select'];
            } else {
              if (this.setting["form"]["fieldfilter"]) {
                postData["select"].push({ fieldname: this.setting["form"]["formfield"], value: 1 });
                postData["select"].push({ fieldname: this.setting["form"]["displayvalue"], value: 1 });
              }
            }

            if (this.setting['sort']) {
              postData["sort"] = this.setting['sort'];
            }

            let url = this.setting["form"]["apiurl"] ? this.setting["form"]["apiurl"] : this.setting["apiurl"];
            let method = this.setting["method"] ? this.setting["method"] : "POST";

            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData) => {

                  const postsArray = [];
                  for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                      let val: any;
                      let displayvalue: any;

                      if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                        let stringValue = this.setting["displayvalue"].split(".");
                        let str1 = stringValue[0];
                        let str2 = stringValue[1];
                        val = responseData[key][str1][str2];
                      } else {
                        displayvalue = this.setting["form"]["displayvalue"];
                        val = responseData[key][displayvalue];
                      }
                      let formfield = this.setting["form"]["formfield"];
                      let formfieldkey = responseData[key][formfield];

                      responseData[key]['autocomplete_id'] = formfieldkey;
                      responseData[key]['autocomplete_displayname'] = val;
                      postsArray.push(responseData[key]);
                    }
                  }
                  this.localStore('form', { [this.setting["fieldname"]]: postsArray });
                  return postsArray;
                })
              )
          }
        })
      ).subscribe((data: any) => {

        this.options = [];
        this.options = data;
        this.isLoadingBox = false;
        this.filldata();
      });


  }

  loadFormdata() {

    this.myControl
      .valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        switchMap((value) => {


          this.isLoadingBox = true;

          if (this.options.length > 0) {
            return of(this.options);
          } else {

            let postData = {};
            postData["search"] = [];

            if (this.setting && this.setting["search"]) {
              postData["search"] = this.setting["search"];
            } else {
              postData["search"].push({ searchfield: this.setting["fieldfilter"], searchvalue: this.setting["fieldfiltervalue"], criteria: "eq" });
            }

            if (this.setting && this.setting["select"]) {
              postData["select"] = this.setting["select"];
            }

            var url = "formdatas/filter";
            var method = "POST";
            
            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData) => {

                  const postsArray = [];

                  for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                      let val;
                      let displayvalue;

                      if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                        let stringValue = this.setting["form"]["displayvalue"].split(".");
                        let str1 = stringValue[0];
                        let str2 = stringValue[1];

                        if (responseData[key] && responseData[key][str1] && responseData[key][str1][str2]) {
                          val = responseData[key][str1][str2];
                        }

                      } else {
                        displayvalue = this.setting["form"]["displayvalue"];
                        val = responseData[key][displayvalue];
                      }

                      let formfield = this.setting["form"]["formfield"];
                      let formfieldkey = responseData[key][formfield];

                      if (val) {
                        responseData[key]['autocomplete_id'] = formfieldkey;
                        responseData[key]['autocomplete_displayname'] = val;
                        postsArray.push(responseData[key]);
                      }


                    }
                  }
                  this.localStore('formdata', { [this.setting["fieldname"]]: postsArray });
                  return postsArray;
                })
              )
          }
        })
      ).subscribe((data: any) => {

        this.options = [];
        this.options = data;
        this.isLoadingBox = false;
        this.filldata();
      });
  }

  filldata() {

    if (this.dbvalue && this.dbvalue !== '' && this.counter == 0) {

      let val: any;
      let displayvalue: any;

      if(typeof this.dbvalue !== 'object') {

        if(this.setting.fieldtype == "lookup" && !this.setting.displayvalue) {
          this.setting.displayvalue = "code";
        }

        var optionObj = this.options.find(p=>p[this.setting && this.setting["form"] && this.setting["form"]["formfield"] ? this.setting["form"]["formfield"] : this.setting["displayvalue"]] == this.dbvalue)
        if(optionObj) {
          this.dbvalue = {};
          this.dbvalue = optionObj;
        }
      }

      if (this.setting && this.setting["form"] && this.setting["form"]["displayvalue"] && this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
        let stringValue = this.setting["form"]["displayvalue"].split(".");
        let str1 = stringValue[0];
        let str2 = stringValue[1];

        val = this.dbvalue[str1][str2];
      } else {
        displayvalue = this.setting && this.setting["form"] && this.setting["form"]["displayvalue"] ? this.setting["form"]["displayvalue"] : this.setting["displayvalue"];
        val = this.dbvalue[displayvalue];
      }

      let formfield = this.setting && this.setting["form"] && this.setting["form"]["formfield"] ? this.setting["form"]["formfield"] : this.setting["formfield"];
      let formfieldkey = this.dbvalue[formfield];

      this.dbvalue['autocomplete_id'] = formfieldkey;
      this.dbvalue['autocomplete_displayname'] = val;

      this.myControl.setValue(this.dbvalue);
      let obj = {
        value: this.dbvalue
      }
      this.optionSelected(obj)

      this.counter++;
    }
  }

  formData() {
    
    let postData = {};
    postData["search"] = [];
    postData["select"] = [];

    if (this.setting && this.setting["search"]) {
      postData["search"] = this.setting['search'];
    } else {
      if (this.setting["form"]["fieldfilter"]) {
        let res = this.setting["form"]["fieldfilter"].split(".");
        if (res[0]) {
          this.setting["form"]["fieldfilter"] = res[0];
        }
        postData["search"].push({ searchfield: this.setting["form"]["fieldfilter"], searchvalue: this.setting["form"]["fieldfiltervalue"], criteria: this.setting["criteria"] ? this.setting["criteria"] : "eq" });
      }
    }

    if (this.setting && this.setting["select"]) {
      postData["select"] = this.setting['select'];
    } else {
      if (this.setting["form"]["fieldfilter"]) {
        postData["select"].push({ fieldname: this.setting["form"]["formfield"], value: 1 });
        postData["select"].push({ fieldname: this.setting["form"]["displayvalue"], value: 1 });
      }
    }

    if (this.setting['sort']) {
      postData["sort"] = this.setting['sort'];
    }

    let url = this.setting["form"]["apiurl"] ? this.setting["form"]["apiurl"] : this.setting["apiurl"];
    let method = this.setting["method"] ? this.setting["method"] : "POST";

    this.isLoadingBox = true;

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data) {
          
          this.options = [];

          if(data && data.length > 0) {
            data.forEach(element => {
              let val: any;
              let displayvalue: any;

              if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                let stringValue = this.setting["form"]["displayvalue"].split(".");
                let str1 = stringValue[0];
                let str2 = stringValue[1];
                val = element[str1][str2];
              } else {
                displayvalue = this.setting["form"]["displayvalue"];
                val = element[displayvalue];
              }
              let formfield = this.setting["form"]["formfield"];
              let formfieldkey = element[formfield];

              element['autocomplete_id'] = formfieldkey;
              element['autocomplete_displayname'] = val;
              this.options.push(element);
            });
            this.isLoadingBox = false;
            this.localStore('form', { [this.setting["fieldname"]]: this.options });
          } else {
            this.isLoadingBox = false;
          }
        }
      }, (err) =>{
        console.log("err", err);
      });
  }

  lookupData() {
    let postData = {};
    postData["search"] = [];
    postData["select"] = [];

    if (this.setting && this.setting["search"]) {
      postData["search"] = this.setting["search"];
    } else {
      var lookupid = this.setting.lookupid ? this.setting.lookupid : this.setting.lookupfieldid
      postData["search"].push({ searchfield: "_id", searchvalue: lookupid, criteria: "eq" });
    }

    if (this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    } else {
      postData["select"].push({ fieldname: "_id", value: 1 });
      postData["select"].push({ fieldname: "data", value: 1 });
    }

    this.isLoadingBox = true;

    var url = "lookups/filter";
    var method = "POST";
    
    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data) {
          this.options = [];
          if(data && data.length > 0) {
            data.forEach(element => {
              if(element && element.data.length !== 0) {
                element.data.forEach(ele => {
                  ele['autocomplete_id'] = ele.code;
                  ele['autocomplete_displayname'] = ele.name;
                  this.options.push(ele);
                });
              }
            });
            this.isLoadingBox = false;
            this.localStore('lookup', { [this.setting["fieldname"]]: this.options });
          } else {
            this.isLoadingBox = false;
          }
        }
      }, (err) =>{
        console.log("err", err);
      });
  }

  formdataData() {
    let postData = {};
    postData["search"] = [];

    if (this.setting && this.setting["search"]) {
      postData["search"] = this.setting["search"];
    } else {
      postData["search"].push({ searchfield: this.setting["form"]["fieldfilter"], searchvalue: this.setting["form"]["fieldfiltervalue"], criteria: "eq" });
    }

    if (this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    }

    this.isLoadingBox = true;

    var url = "formdatas/filter";
    var method = "POST";
    
    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data) {

          this.options = []

          if(data && data.length > 0) {
            data.forEach(element => {
              let val;
              let displayvalue;

              if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                let stringValue = this.setting["form"]["displayvalue"].split(".");
                let str1 = stringValue[0];
                let str2 = stringValue[1];

                if (element && element[str1] && element[str1][str2]) {
                  val = element[str1][str2];
                }

              } else {
                displayvalue = this.setting["form"]["displayvalue"];
                val = element[displayvalue];
              }

              let formfield = this.setting["form"]["formfield"];
              let formfieldkey = element[formfield];

              if (val) {
                element['autocomplete_id'] = formfieldkey;
                element['autocomplete_displayname'] = val;
                this.options.push(element);
              }
            });
            this.isLoadingBox = false;
            this.localStore('formdata', { [this.setting["fieldname"]]: this.options });
          } else {
            this.isLoadingBox = false;
          }
        }
      }, (err) =>{
        console.log("err", err);
      });
  }

  ObjectidData() {

    let refcollection: any;
    let reffieldname: any;
    let refschema: any;

    refcollection = this.setting.option.ref;
    refschema = this.setting.option.refschema;
    reffieldname = this.setting.option.reffieldname;

    let postData = {};
    postData['refcollection'] = refcollection;
    postData['refschema'] = refschema;
    postData['refselect'] = reffieldname;
    
    this._commonService
      .GetByCollection(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        if (data) {
          var cnt = 0;
          for (var i in data[0]) {
            if (cnt == 1) {
              this.setting.refkey = i;
            }
            cnt++;
          }
          this.setting.optionsList = [];

          if (Array.isArray(data)) {
            if (data && data.length !== 0) {

              data.forEach(eleref => {

                eleref.autocomplete_id = eleref._id;
                eleref.autocomplete_displayname = eleref[this.setting.refkey];

                this.options.push(eleref);
              });
              this.localStore('objectid', { [this.setting["fieldname"]]: this.options });
            }
          }
          
          this.filldata();
        }
    });
  }

  optionSelected(option: any) {
    this.myControl.setValue(option.value);
    this.inputModel = option.value;
    this.inputModelChange.emit(this.inputModel)
  }

  displayFn(user: any): string {
    return user && user.autocomplete_displayname ? user.autocomplete_displayname : '';
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
      this.inputModel = "";
    this.inputModelChange.emit(this.inputModel)
    }
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.options
        .filter(option => {
          if (option.autocomplete_displayname) {
            return option.autocomplete_displayname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.options.slice();
    }
    return results;
  }

  localStore(key: any, obj: any) {
    let [first] = Object.keys(obj)
    if (localStorage.getItem(key) === null) {
      return window.localStorage.setItem(key, JSON.stringify(obj));
    } else {

      var oldItems: any;
      oldItems = JSON.parse(localStorage.getItem(key)) || {};
      if (oldItems[first]) {
        var output: any[] = [...oldItems[first], ...obj[first]];
        oldItems[first] = [];
        oldItems[first] = output;
      } else {
        oldItems[first] = [];
        oldItems[first] = obj[first];
      }
      return window.localStorage.setItem(key, JSON.stringify(oldItems));
    }
  }

  localGet(key: any) {
    return JSON.parse(window.localStorage.getItem(key));
  }
}
