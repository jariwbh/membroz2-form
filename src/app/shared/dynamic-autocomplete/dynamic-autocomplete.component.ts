import { Component, EventEmitter, forwardRef, HostBinding, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../core/services/common/common.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'dynamic-autocomplete',
  templateUrl: './dynamic-autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicAutocompleteComponent),
      multi: true
    }
  ]
})
export class DynamicAutocompleteComponent implements OnInit, ControlValueAccessor{

  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoading: boolean = false;
  myControl = new FormControl();
  selectedValue;
  filteredOptions: Observable<string[]>;
  question = 'Would you like to add ';
  options: any[] = [];

  counter = 0;

  isLoadingBox: boolean = false;

  @Input() dbvalue: any;
  @Input() setting: any;
  @Output() added = new EventEmitter();
  @Output() inputModelChange = new EventEmitter<string>();

  // Function to call when the option changes.
  onChange = (option: string) => {};

  // Function to call when the input is touched (when the autocomplete is clicked).
  onTouched = () => {};

  get value() {
    return this.selectedValue;
  }
  
  constructor(
    private _commonService: CommonService,
  ) {
  }

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

  preloaddata() {
    
    if (this.options.length == 0) {
      if (this.setting && this.setting.fieldtype == "form") {
        this.formData()
      } else if (this.setting && this.setting.fieldtype == "lookup") {
        this.lookupData()
      } else if (this.setting && this.setting.fieldtype == "formdata")  {
        this.formdataData()
      }
    }
  }

  loadData() {

    if(this.setting && this.setting.fieldtype == "form") {
      if (localStorage.getItem("form") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("form")) || {};
        if(oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
          this.filldata();
        } else {
          this.loadForms()
        }
      } else {
        
        if(this.dbvalue && this.dbvalue !== '') {
          this.filldata()
        }
        this.loadForms()
      }
    } else if (this.setting && this.setting.fieldtype == "lookup") {
      if (localStorage.getItem("lookup") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("lookup")) || {};
        if(oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
          this.filldata();
        } else {
          this.loadLookup()
        }
      } else {
        if(this.dbvalue && this.dbvalue !== '') {
          this.filldata()
        }
        this.loadLookup()
      }
    } else if (this.setting && this.setting.fieldtype == "formdata") {

      if (localStorage.getItem("formdata") !== null) {
        var oldItems: any;
        oldItems = JSON.parse(localStorage.getItem("formdata")) || {};
        if(oldItems[this.setting["fieldname"]]) {
          this.options = oldItems[this.setting["fieldname"]];
          this.filldata();
        } else {
          this.loadFormdata()
        }
      } else {
        
        if(this.dbvalue && this.dbvalue !== '') {
          this.filldata()
        }
        this.loadFormdata()
      }
    }
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

            if(this.setting && this.setting["search"]) {
              postData["search"] = this.setting["search"];
            } else {
              if (this.setting["form"]["fieldfilter"]) {
                let res = this.setting["form"]["fieldfilter"].split(".");
                if (res[0]) {
                  this.setting["form"]["fieldfilter"] = res[0];
                }
                postData["search"].push({searchfield: this.setting["form"]["fieldfilter"], searchvalue: this.setting["form"]["fieldfiltervalue"], criteria: this.setting["criteria"] ? this.setting["criteria"] : "eq"});
                
              }
            }

            if(this.setting && this.setting["select"]) {
              postData["select"] = this.setting["select"];
            } else {
              if (this.setting["form"]["fieldfilter"]) {
                postData["select"].push({fieldname: this.setting["form"]["formfield"], value: 1});
                postData["select"].push({fieldname: this.setting["form"]["displayvalue"],  value: 1});
              }
            }

            if(this.setting && this.setting["sort"]) {
              postData["sort"] = this.setting["sort"];
            }

            if(this.setting && this.setting["formname"]) {
              postData["formname"] = this.setting["formname"];
            }
            
            let url =  this.setting["form"]["apiurl"] ? this.setting["form"]["apiurl"] : this.setting["apiurl"];
            let method = this.setting["method"] ? this.setting["method"] : "POST"; 
 
            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData)=>{
                  const postsArray = [];
                  for(const key in responseData) {
                    if(responseData.hasOwnProperty(key)) {
                      let val: any;
                      let displayvalue: any;
                      if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                        let stringValue = this.setting["form"]["displayvalue"].split(".");
                        let str1 = stringValue[0];
                        let str2 = stringValue[1];
                        if(responseData[key] && responseData[key][str1] && responseData[key][str1][str2]) {
                          val = responseData[key][str1][str2];
                        }
                      } else {
                        displayvalue = this.setting["form"]["displayvalue"];
                        val = responseData[key][displayvalue];
                      }
                      let formfield = this.setting["form"]["formfield"];
                      let formfieldkey = responseData[key][formfield];
                      if(val) {
                        responseData[key]['autocomplete_id'] = formfieldkey;
                        responseData[key]['autocomplete_displayname'] = val;
                        postsArray.push(responseData[key]);
                      }
                      
                    }
                  }
                  this.localStore('form', { [this.setting["fieldname"]] : postsArray});
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

            if(this.setting && this.setting["search"]) {
              postData["search"] = this.setting["search"];
            } else {
              var lookupid = this.setting.lookupid ? this.setting.lookupid : this.setting.lookupfieldid
              postData["search"].push({searchfield: "_id", searchvalue: lookupid, criteria: "eq"});
            }

            if(this.setting && this.setting["select"]) {
              postData["select"] = this.setting["select"];
            } else {
              postData["select"].push({fieldname: "_id", value: 1 });
              postData["select"].push({fieldname: "data", value: 1 });
            }

            if(this.setting && this.setting["formname"]) {
              postData["formname"] = this.setting["formname"];
            }

            var url = "lookups/filter";
            var method = "POST";
    
            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData)=>{
                  
                  const postsArray = [];
                  for(const key in responseData) {
                    if(responseData.hasOwnProperty(key)) {
                      if(responseData[key]["data"] && responseData[key]["data"].length !== 0) {
                        responseData[key]["data"].forEach((ele) => {
                          ele['autocomplete_id'] = ele.code;
                          ele['autocomplete_displayname'] = ele.name;
                          postsArray.push(ele);
                        });
                      }
                    }
                  }
                  this.localStore('lookup', { [this.setting["fieldname"]] : postsArray});
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

            if(this.setting && this.setting["search"]) {
              postData["search"] = this.setting["search"];
            } else {
              postData["search"].push({searchfield: this.setting["fieldfilter"], searchvalue: this.setting["fieldfiltervalue"], criteria: "eq"});
            }

            if(this.setting && this.setting["select"]) {
              postData["select"] = this.setting["select"];
            }

            if(this.setting && this.setting["formname"]) {
              postData["formname"] = this.setting["formname"];
            }

            var url = "formdatas/filter";
            var method = "POST";

            return this._commonService
              .commonServiceByUrlMethodData(url, method, postData)
              .pipe(
                takeUntil(this.destroy$),
                map((responseData)=>{
                  const postsArray = [];
                  for(const key in responseData) {
                    if(responseData.hasOwnProperty(key)) {
                      let val: any;
                      let displayvalue: any;
                      if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
                        let stringValue = this.setting["form"]["displayvalue"].split(".");
                        let str1 = stringValue[0];
                        let str2 = stringValue[1];
                        if(responseData[key] && responseData[key][str1] && responseData[key][str1][str2]) {
                          val = responseData[key][str1][str2];
                        }
                      } else {
                        displayvalue = this.setting["form"]["displayvalue"];
                        
                        val = responseData[key][displayvalue];
                      }
                      let formfield = this.setting["form"]["formfield"];
                      let formfieldkey = responseData[key][formfield];
                      
                      
                      if(val) {
                        responseData[key]['autocomplete_id'] = formfieldkey;
                        responseData[key]['autocomplete_displayname'] = val;
                        postsArray.push(responseData[key]);
                      }

                    }
                  }
                  this.localStore('formdata', { [this.setting["fieldname"]] : postsArray});
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
    
    if(this.dbvalue && this.dbvalue !== '' && this.counter == 0) {

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

      setTimeout(() => {
        let obj = {
          value: this.dbvalue
        }
        this.optionSelected(obj)  
      }, 1000);
      
      
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

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
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

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
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
      postData["search"].push({ searchfield: this.setting["fieldfilter"], searchvalue: this.setting["fieldfiltervalue"], criteria: "eq" });
    }

    if (this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    }

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
    }

    this.isLoadingBox = true;

    var url = "formdatas/filter";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data) {
          this.options = [];
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

  optionSelected(option) {

    if (option && option.value && option.value.autocomplete_displayname && option.value.autocomplete_displayname.indexOf(this.question) === 0) {
      let newOption = option.value.substring(this.question.length).split('?')[0];
      this.options.push(newOption);
      this.added.emit(newOption);
      
      this.myControl.setValue(newOption);
      this.writeValue(newOption);
      this.inputModelChange.emit(newOption)
    } else {
      this.myControl.setValue(option.value);
      this.writeValue(option.value);
      this.inputModelChange.emit(option.value)
    }
  }

  displayFn(user: any): string {
    return user && user.autocomplete_displayname ? user.autocomplete_displayname : '';
  }

  handleEmptyInput(event: any){
    if(event.target.value === '') {
      this.myControl.setValue("");
      this.writeValue("");
      this.inputModelChange.emit("")
    }
  }

  enter() {
    
    const controlValue = this.myControl.value;
    if (!this.options.some(entry => entry === controlValue)) {
      this.added.emit(controlValue);
      const index = this.options.push(controlValue);
      setTimeout(
        () => {
          this.myControl.setValue(controlValue);
          this.writeValue(controlValue);
        }
      );
    } else {
      this.writeValue(controlValue);
    }
  }

  // Allows Angular to update the model (option).
  // Update the model and changes needed for the view here.
  writeValue(option: string): void {
    this.selectedValue = option;
    this.onChange(option);
  }

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (option: string) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.options
        .filter(option => {
          if(option.autocomplete_displayname) {
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
      if(oldItems[first]) {
        var output: any [] = [...oldItems[first], ...obj[first]];
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
