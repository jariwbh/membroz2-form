import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, AfterViewChecked , ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SafeHtml } from "@angular/platform-browser";

import { CommonService } from '../../core/services/common/common.service';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../../shared/components/basicValidators';

import { overEighteen } from '../../shared/components/over-eighteen.validator';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { BaseLiteComponemntComponent } from '../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styles: [
    `
    ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
      border: 2px solid !important;
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit, AfterViewChecked {

  _sectionLists: any[] = [];
  _groups: any[] = [];
  _groupLists: any[] = [];
  _groupAddedValue: any[] = [];

  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  _labelSubmit: string;

  uploader: FileUploader;
  response: any[] = [];
  private title: string;
  customeUploader: any[] = [];

  formImageArray: any[] = [];
  groupformImageArray: any [] = [];
  _groupSelectedImage: any[] = [];

  quickfromstyle = "single";
  quickformschemaname = "users";

  deleteobj: any;
  ishidedeletebutton = false;

  _loginUserRole: any;
  wfpermission: any;

   _wfpermissionlabelSubmit: any;
   isdisablesavebutton: boolean = false;
   reason: any;

   form: FormGroup;
   arr: FormArray;
   submitted: boolean;

   recprdEligibilityForWfPermission: boolean = false;

   _loginUserId: any;

    minDate: Date;
    maxDate: Date;

    allowedFileType = [ "xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv", "pdf", "jpg", "jpeg", "gif", "png", "tif", "tiff" ]
    maxFileSize = 5 * 1024 * 1024;

    separateDialCode = true;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];

    startDate: Date;

    constructor(
      private fb: FormBuilder,
      private cloudinary: Cloudinary,
      private cdr: ChangeDetectorRef
    ) {
        super();

        this.form = fb.group({
          'reason': [this.reason, Validators.required],
        });
    }

    @Input('tabData') tabDataValue: any[] = [];
    @Input('formsModel') formsModelValue: any = {};
    @Input('bindIdData') bindIdDataValue: any = {};
    @Input('langResource') langResourceValue: any[] = [];
    @Input('isdisablesavebutton') isdisablesavebuttonValue: any = false;

    @Output() childSubmitData: EventEmitter<any> = new EventEmitter<any>();
    @Output() disabledDirtyForm: EventEmitter<any> = new EventEmitter<any>();

    async ngOnInit() {

      await super.ngOnInit();

      const currentYear = new Date().getFullYear();
      this.minDate = new Date(currentYear - 100, 0, 1);
      this.maxDate = new Date(currentYear + 100, 11, 31);

      this.getRoleDetail();

      this.recprdEligibilityForWfPermission = false;

      this.title = '';

      if (this.bindIdDataValue) {

        if (this.formsModelValue['dispalySubmitBtn'] && this.formsModelValue['dispalySubmitBtn'] !== '') {
          this._labelSubmit =   this.langResourceValue[this.formsModelValue['dispalySubmitBtn']] ? this.langResourceValue[this.formsModelValue['dispalySubmitBtn']] : this.formsModelValue['dispalySubmitBtn'];
        } else {
          this._labelSubmit =   this.langResourceValue['submit'] ? this.langResourceValue['submit'] : 'Submit';
        }

        if (this.formsModelValue['ishidedeletebutton'] != undefined && this.formsModelValue['ishidedeletebutton'] !== '') {
          this.ishidedeletebutton =   this.langResourceValue[this.formsModelValue['ishidedeletebutton']] ? this.langResourceValue[this.formsModelValue['ishidedeletebutton']] : this.formsModelValue['dispalySubmitBtn'];
        }
        
      } else {
        this.ishidedeletebutton = true;
        this._labelSubmit =   this.langResourceValue['save'] ? this.langResourceValue['save'] : 'Save';
      }

      this._sectionLists = this.tabDataValue;
      

      this._sectionLists.forEach(ele => {
        ele.forEach(element => {

          if (element.groupname) {
            this._groups.push(element);
          }

          if (element.fieldtype == "image" || element.fieldtype == "multi_image" || element.fieldtype == "attachment" || element.fieldtype == "gallery") {
            if (!this.formImageArray[element.fieldname]) {
              this.formImageArray[element.fieldname] = [];
            }
            if (this.bindIdDataValue) {
              if (element.groupname) {

                if (!this.groupformImageArray[element.fieldname]) {
                  this.groupformImageArray[element.fieldname] = [];
                }

                if (this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.groupname] && this.bindIdDataValue['property'][element.groupname].length !== 0) {
                  this.bindIdDataValue['property'][element.groupname].forEach(e => {

                    if (e[element.fieldname]) {
                      if (e[element.fieldname] && e[element.fieldname].length !== 0) {
                        if (!this.formImageArray[element.fieldname]) {
                          this.formImageArray[element.fieldname] = [];
                        }
                        this.formImageArray[element.fieldname] = e[element.fieldname];
                      }
                    }
                  });
                }
              } else {
                if (this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname].length !== 0) {
                  if (!this.formImageArray[element.fieldname]) {
                    this.formImageArray[element.fieldname] = [];
                  }
                  this.formImageArray[element.fieldname] = this.bindIdDataValue['property'][element.fieldname];
                }
              }
            }
          } else if (element.fieldtype == "datepicker") {
            if(element.validationData && element.validationData == "dateOfBirthVal") {
              element.maxDate = new Date();
            }
          }
        });
      });

      if (this._groups.length !== 0) {
        this._groupLists = this.groupBy(this._groups, 'groupname');
      }

      this._groupLists.forEach(element => {
        this._groupAddedValue[element[0].groupname] = [];
      });

      if (this.bindIdDataValue) {
        this.setGroupArrayValue();
      }

      this.imageConfigration();

      this.isdisablesavebutton = false;

    }

    public getLang(key: string, value: string) {
      return this.langResourceValue[key] ? this.langResourceValue[key] : value;
    }

    ngAfterViewInit() {
    }

    ngAfterViewChecked() {
      this.cdr.detectChanges();
    }

    getRoleDetail() {

      if(this._loginUserRole && this._loginUserRole['permissions'] && this._loginUserRole['permissions'].length !== 0) {
        let cnt = 0;

        this._loginUserRole['permissions'].forEach(element => {

          if(element.formname == this.formsModelValue['formname'] && element.wfpermission) {
            this.wfpermission = element.wfpermission;
            if(this.wfpermission == "approver") {
                this._wfpermissionlabelSubmit = "Approved";
              } else {
                this._wfpermissionlabelSubmit = "Reviewed";
              }
          }
        });
      }

      if(this.bindIdDataValue && this.bindIdDataValue['wfstatus']) {
        this.recprdEligibilityForWfPermission = false;

        if(this.bindIdDataValue && this.bindIdDataValue['wfuserid'] && this.bindIdDataValue['wfuserid'].length !== 0) {
          var wfuseridObj = this.bindIdDataValue['wfuserid'].find(p => p == this._loginUserId);

          if(wfuseridObj) {
            if(this.wfpermission == "approver" )  {
              if(this.bindIdDataValue['wfstatus'] == "approver" || this.bindIdDataValue['wfstatus'] == "reviewed") {
                  this.recprdEligibilityForWfPermission = true;
              }
            } else if (this.wfpermission == "reviewer") {
              if(this.bindIdDataValue['wfstatus'] == "reviewer") {
                  this.recprdEligibilityForWfPermission = true;
              }
            }
          }
        }


      }
    }

    imageConfigration() {

      this._sectionLists.forEach(ele => {
        ele.forEach(element => {

          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == "attachment" || element.fieldtype == "gallery") {
  
            var auth_cloud_name = this._authService.auth_cloud_name ? this._authService.auth_cloud_name : this.cloudinary.config().cloud_name;
  
            const uploaderOptions: FileUploaderOptions = {
              url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
              autoUpload: true,
              isHTML5: true,
              removeAfterUpload: true,
              headers: [
                {
                  name: 'X-Requested-With',
                  value: 'XMLHttpRequest'
                }
              ],
             // allowedFileType: element.allowedfiletype ? element.allowedfiletype : this.allowedFileType,
              //maxFileSize: element.maxfilesize ? element.maxfilesize : Number(this.maxFileSize)
  
            };
  
            if(element.fieldtype == 'gallery') {
              uploaderOptions.allowedFileType = ['image']
            }
  
            let fieldname = element.fieldname;
            this.customeUploader[fieldname] = new FileUploader(uploaderOptions);
  
            this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {
              form.append('upload_preset', this.cloudinary.config().upload_preset);
              let tags = element.fieldname;
  
              if (this.title) {
                form.append('context', `photo=${element.fieldname}`);
                tags = element.fieldname;
              }
              form.append('tags', tags);
              form.append('file', fileItem);
  
              fileItem.withCredentials = false;
              return { fileItem, form };
            };
  
            const upsertResponse = fileItem => {
  
              $(".loading_" + element.fieldname).show();
  
              if (fileItem && fileItem.status == 200) {
  
                let fieldnameTags = fileItem.data.tags[0];
  
                if (!this.formImageArray[fieldnameTags]) {
                  this.formImageArray[fieldnameTags] = [];
                }
  
                if (!this.groupformImageArray[fieldnameTags]) {
                  this.groupformImageArray[fieldnameTags] = [];
                }
  
                if (!element.value) {
                  element.value = "";
                }
  
                let extension: any;
                if (fileItem.file) {
                  extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
                }
  
                let fileInfo = {
                  attachment: fileItem.data.secure_url,
                  extension: extension,
                  originalfilename: fileItem.data.original_filename
                };

                if(element.multiselect == false) {
                  this.formImageArray[fieldnameTags] = [];
                  this.groupformImageArray[fieldnameTags] = [];

                }
  
                this.formImageArray[fieldnameTags].push(fileInfo);
                this.groupformImageArray[fieldnameTags].push(fileInfo);
  
  
  
                element.value = fileItem.data.secure_url;
  
  
  
                $('#' + fieldnameTags).val(fileItem.data.secure_url);
  
                $(".loading_" + element.fieldname).hide();
  
              }
  
            };
  
            this.customeUploader[fieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
              upsertResponse(
                {
                  file: item.file,
                  status,
                  data: JSON.parse(response)
                }
              );
  
            this.customeUploader[fieldname].onProgressItem = (fileItem: any, progress: any) =>
              upsertResponse(
                {
                  file: fileItem.file,
                  progress
                });
  
            this.customeUploader[fieldname].onWhenAddingFileFailed = (item: any, filter: any) => {
                  let message = '';
                  switch (filter.name) {
                    case 'fileSize':
                      message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(element.maxfilesize ? element.maxfilesize : (Number(this.maxFileSize) * 1024 * 1024));
                      this.showNotification("top", "right", message, "danger");
                      break;
                    default:
                      //message = 'Error trying to upload file '+item.name;
                      message = 'Please upload image file only.';
                      this.showNotification("top", "right", message, "danger");
                      break;
                  }
                };
          }
  
        });  
      });

      
    }

    formatBytes(bytes: any, decimals? : any) {
      if (bytes == 0) return '0 Bytes';
      const k = 1024,
        dm = decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    setGroupArrayValue() {
      this._groupLists.forEach(element => {
        let grpname;
        if (element[0]['groupname']) {
          grpname = element[0]['groupname'];
          for (let key in this.bindIdDataValue['property']) {
            if (grpname == key) {
              this._groupAddedValue[grpname] = this.bindIdDataValue['property'][key];
            }
          }
        }
      });

      setTimeout(() => {
        this.makeForm();
      }, 1000);

    }

    makeForm() {
      const group: any = {};
      this._sectionLists.forEach(ele => {
        ele.forEach(element => {
          if(element.fieldtype == 'group') {
            // if(this.bindIdDataValue) {
            //   if(this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname].length > 0) {
            //     group[element.fieldname] = this.fb.array([])
            //   } else {
            //     group[element.fieldname] = this.fb.array([this.createItem(element.fields)])
            //   }
            // } else {
              group[element.fieldname] = this.fb.array([this.createItem(element.fields)])
            //}
          } else if (element.fieldtype == 'checkbox') {
            group[element.fieldname] = new FormControl([])
          } else if (element.fieldtype == 'readonly') {
            group[element.fieldname] = new FormControl(element.defaultvalue);
          } else if (element.fieldtype == 'mobile' || element.fieldtype == 'alternatenumber') {
            if (element.required) {
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
            }
          } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
            if (element.required) {
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
            }
          } else {
            if (element.required && element.fieldtype == "slide_toggle") {
              group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
            } else if (element.required) {
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
            } else {
              group[element.fieldname] = new FormControl(null);
            }
          }
        });
      });

      this.dynamicForm = this.fb.group(group);

      setTimeout(() => {
        this._sectionLists.forEach(ele => {
          ele.forEach(element => {
            
            if(this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && element.fieldname) {
              if(element.fieldtype !== "group") {
                this.dynamicForm.controls[element.fieldname].setValue(this.bindIdDataValue['property'][element.fieldname]);
              } else if (element.fieldtype == "group") {
                
                // let control = <FormArray>this.dynamicForm.controls[element.fieldname];
                // this.bindIdDataValue['property'][element.fieldname].forEach(x => {
                //   control.push(this.fb.group(x));
                // })
              }
            }

            if(element.fieldtype == "hidden" || element.fieldtype == "readonly") {
              this.dynamicForm.controls[element.fieldname].setValue(element.defaultvalue);
            }
          });
        });
      }, 500);

    }

    editItem(element: any) {
      const group: any = {};
      let control = <FormArray>this.dynamicForm.controls[element.fieldname];
      this.bindIdDataValue['property'][element.fieldname].map((item, index) => {
        element.fields.forEach(elementFields => {
          if(item[elementFields.fieldname]) {
            if (elementFields.fieldtype == 'checkbox') {
              group[elementFields.fieldname] = new FormControl([item[elementFields.fieldname]])
            } else if (elementFields.fieldtype == 'readonly') {
              group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname]);
            } else if (elementFields.fieldtype == 'mobile' || elementFields.fieldtype == 'alternatenumber') {
              if (elementFields.required) {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
              } else {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
              }
            }  else if (elementFields.fieldtype == 'primaryemail' || elementFields.fieldtype == 'secondaryemail') {
              if (elementFields.required) {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required, BasicValidators.email]));
              } else {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([BasicValidators.email]));
              }
            } else {
              if (elementFields.required && element.fieldtype == "slide_toggle") {
                group[elementFields.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
              } else if (elementFields.required) {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required]));
              } else {
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname]);
              }
            }
            control.push(this.fb.group(group));
          }
        });
      })
    }

    deleteGroupItem(fields: any, index: any) {
      (this.dynamicForm.get(fields.fieldname) as FormArray).removeAt(index);
    }

    createItem(fields: any) {
      const group: any = {};
      fields.forEach(element => {
        if (element.fieldtype == 'checkbox') {
          group[element.fieldname] = new FormControl([])
        } else if (element.fieldtype == 'readonly') {
          group[element.fieldname] = new FormControl(element.defaultvalue);
        } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
          if (element.required) {
            group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
          } else {
            group[element.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
          }
        } else {
          if (element.required && element.fieldtype == "slide_toggle") {
            group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
          } else if (element.required) {
            group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
          } else {
            group[element.fieldname] = new FormControl(null);
          }
        }
      });
      return this.fb.group(group);
    }

    groupBy(collection: any, property: any) {

      let i = 0, val, index,
        values = [], result = [];
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

    addItem(fields: any) {
      this.arr = this.dynamicForm.get([fields.fieldname]) as FormArray;
      this.arr.push(this.createItem(fields.fields));
    }

    onDynamicFormSubmit(value: any, isValid: boolean) {
      this.dynamicSubmitted = true;
      this.isdisablesavebuttonValue = true;
      if (!isValid) {
        
        this.isdisablesavebuttonValue = false;
        this.showNotification('top', 'right', 'Fill in required fields !!', 'danger');
        return false;
      } else {

        var groupValidationArray: any [] = [];

        this._sectionLists.forEach(ele => {
          ele.forEach(ele2 => {

            if (ele2.fieldtype == 'lookup' || ele2.fieldtype == 'form' || ele2.fieldtype == 'formdata') {

              if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname]['autocomplete_id']) {
                this.dynamicForm.value[ele2.fieldname] = this.dynamicForm.value[ele2.fieldname]['autocomplete_id'];
              }

            } else if (ele2.fieldtype == 'image' || ele2.fieldtype == 'multi_image' ||  ele2.fieldtype == 'attachment' ||  ele2.fieldtype == 'gallery') {
              for (let key in this.formImageArray) {
                if (key == ele2.fieldname) {
                  this.dynamicForm.value[ele2.fieldname] = this.formImageArray[key];
                }
              }
            } else if (ele2.fieldtype == "group") {
              ele2.fields.forEach(elementGroup => {
                if (elementGroup.fieldtype == 'lookup' || elementGroup.fieldtype == 'form' || elementGroup.fieldtype == 'formdata') {
                  
                  if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {

                    this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                      if(elementGroupValue && elementGroupValue[elementGroup.fieldname] && elementGroupValue[elementGroup.fieldname]['autocomplete_id']) {
                        elementGroupValue[elementGroup.fieldname] = elementGroupValue[elementGroup.fieldname]['autocomplete_id']
                      }
                    });
                    
                  }
                  
                } else if (elementGroup.fieldtype == 'image' || elementGroup.fieldtype == 'multi_image' ||  elementGroup.fieldtype == 'attachment' ||  elementGroup.fieldtype == 'gallery') {
                  for (let key in this.formImageArray) {
                    if (key == elementGroup.fieldname) {
                      // if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {
                      //   this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                          
                      //       elementGroupValue[elementGroup.fieldname] = elementGroupValue[elementGroup.fieldname]['autocomplete_id']
                          
                      //   });
                      // }

                      //this.dynamicForm.value[ele2.fieldname] = this.formImageArray[key];
                    }
                  }
                }
              });
            }

          });
        });
       
        //console.log("this.dynamicForm.value", this.dynamicForm.value);
        this.childSubmitData.emit(this.dynamicForm.value);

        
      }
    }

    uuid() {
      let uuid = '', i, random;
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
          uuid += '-'
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
      }
      return uuid;
    }

    removecheckboxvaluefromArray(id: any, array: any) {
      for (const i in array) {
        if (array[i] == id) {
          array.splice(i, 1);
        }
      }
    }

    typeOf(value: any) {
      return typeof value;
    }

    displayArray(array: any) {
      var arr = [];
      var separator = "attachment"

      for (var key in array) {
        if (array.hasOwnProperty(key)) {
            arr.push(array[key]);
        }
      }

      return arr.join(separator || ",");
    }

    groupAddClick(groupname: any) {

      let groupStatus = $('#' + groupname).val();

      let grp = {};
      let cntCheck = 0;
      let emptyCheck = 0;
      let errorCount = 0;

      var groupValidationArray: any[] = [];

      this._groupLists.forEach(element => {
        element.forEach(ele => {
          if (ele.groupname == groupname) {
            cntCheck++;
            let val: any;

            if (ele.fieldtype == 'checkbox') {
              if (ele.lookupdata.length !== 0) {
                let cnt = 0;
                val = [];
                ele.lookupdata.forEach(e1 => {
                  const isChecked = <HTMLInputElement>document.getElementById('check_' + ele.fieldname + '_' + cnt);
                  if (isChecked.checked == true) {
                    val.push(e1.key);
                  }
                  cnt++;
                });
              } else {
                val = '';
              }
            } else if (ele.fieldtype == 'radio') {
              if (ele.lookupdata.length !== 0) {
                let cnt = 0;
                ele.lookupdata.forEach(e1 => {
                  const isChecked = <HTMLInputElement>document.getElementById('radio_' + ele.fieldname + '_' + cnt);
                  if (isChecked.checked == true) {
                    val = e1['key'];
                  }
                  cnt++;
                });
              } else {
                val = '';
              }
            } else if (ele.fieldtype == 'multi_image') {
              if (this.dynamicForm.value[ele.fieldname]) {
                val = this.dynamicForm.value[ele.fieldname];
              }
            } else if (ele.fieldtype == 'attachment' || ele.fieldtype == 'gallery') {

              for (var key in this.groupformImageArray) {
                if(key == ele.fieldname) {
                  val = this.groupformImageArray[key];
                  this.groupformImageArray[key] = [];
                }
              }

            } else {
              val = $('#' + ele.fieldname).val();
            }

            if (val == '' || val == null) {
              emptyCheck++;
            }

            if (ele.validationData) {
              if (ele.validationData == 'requiredVal') {
                if (val == '' || val == null) {
                  errorCount++;
                  $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                  setTimeout(() => {
                    $('#error_group_validation_' + ele.fieldname).html('');
                  }, 3000);

                }
              } else if (ele.validationData == 'emailVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val == '' || val == null) {
                    if (!this.isValidEmailAddress(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Email');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }

                }
              } else if (ele.validationData === 'urlVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val == '' || val == null) {
                    if (!this.validURL(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid URL');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }

                }
              } else if (ele.validationData == 'onlyNumberVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val == '' || val == null) {
                    if (!this.isANumber(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Number');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }

                }
              } else if (ele.validationData == 'mobileNumberVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val !== '' && val !== null) {
                    if (!this.isValidMobileNumber(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Mobile Number');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }
                }
              }  else if (ele.validationData == 'adultDateVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val !== '' && val !== null) {
                    if (!this.isadultDateVal(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Date');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }
                }
              } else if (ele.validationData == 'onlyNumberOrDecimalVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val == '' || val == null) {
                    if (this.insertonlynumberordecimal(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Decimal Number');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }

                }
              } else if (ele.validationData == 'validPercentVal') {
                if (ele.isMandatory == "yes") {
                  if (val == '' || val == null) {
                    errorCount++;
                    $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                    setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                  }
                } else {
                  if (val == '' || val == null) {
                    if (!this.insertonlyvalidperc(val)) {
                      errorCount++;
                      $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is not valid Percentage');

                      setTimeout(() => {
                        $('#error_group_validation_' + ele.fieldname).html('');
                      }, 3000);
                    }
                  }

                }
              }
            } else {
              if (ele.isMandatory == "yes") {
                if (val == '' || val == null) {
                  errorCount++;
                  $('#error_group_validation_' + ele.fieldname).html(ele.fielddisplaytext + ' is required');

                  setTimeout(() => {
                      $('#error_group_validation_' + ele.fieldname).html('');
                    }, 3000);
                }
              }
            }

            let lbl = ele.fieldname;
            grp[lbl] = val;
            grp['id'] = this.uuid();

          }

          if(ele.groupname && ele.groupvalidation) {

            var groupValidationObj = groupValidationArray.find(p => p.groupname == ele.groupname);

            if(!groupValidationObj) {
              let obj = {
                groupname: ele.groupname,
                groupvalidation: ele.groupvalidation
              }
              groupValidationArray.push(obj);
            }
          }

        });
      });

      if (groupStatus == 0) {

        if(groupValidationArray && groupValidationArray.length !== 0 && this._groupAddedValue[groupname] && this._groupAddedValue[groupname].length !== 0) {

          var groupValidationObj = groupValidationArray.find(p => p.groupname == groupname);

          if(groupValidationObj) {

            if(groupValidationObj.groupvalidation && groupValidationObj.groupvalidation.maxitems && (Number(this._groupAddedValue[groupname].length) >= Number(groupValidationObj.groupvalidation.maxitems))) {
              this.showNotification('top', 'right', groupname + ' Maximum ' + groupValidationObj.groupvalidation.maxitems + ' record are allowed', 'danger');
              errorCount++;
            }

            if(groupValidationObj.groupvalidation && groupValidationObj.groupvalidation.unique) {

              var uniquefieldname = groupValidationObj.groupvalidation.unique;

              var newUniqueValue = grp[uniquefieldname];

              var gropArrayObj = this._groupAddedValue[groupname].find(p=> p[uniquefieldname] == newUniqueValue && newUniqueValue !== 'Daughter' && newUniqueValue !== 'Son');

              if(gropArrayObj) {

                this.showNotification('top', 'right', uniquefieldname + ' field should be unique.', 'danger');
                errorCount++;

                $('#error_group_validation_' + uniquefieldname).html(uniquefieldname + ' field should be unique');

                  setTimeout(() => {
                    $('#error_group_validation_' + uniquefieldname).html('');
                  }, 3000);

              }

            }
          }
        }

        if ((cntCheck == emptyCheck) || (errorCount !== 0)) {
          $('#error_' + groupname).show();
          setTimeout(() => {
            $('#error_' + groupname).hide();
          }, 2000);

        } else {

          this._groupAddedValue[groupname].push(grp);
          let groupStatus = $('#' + groupname).val(0);
          $('#btn_' + groupname).val('Add ' + groupname);


          this._groupLists.forEach(element => {
            element.forEach(ele => {
              if (ele.fieldtype == 'checkbox') {
                if (ele.lookupdata.length !== 0) {
                  let cnt = 0;
                  ele.lookupdata.forEach(e1 => {
                    const isChecked = <HTMLInputElement>document.getElementById('check_' + ele.fieldname + '_' + cnt);
                    isChecked.checked = false;
                    cnt++;
                  });
                }
              } else if (ele.fieldtype == 'radio') {
                if (ele.lookupdata.length !== 0) {
                  let cnt = 0;
                  ele.lookupdata.forEach(e1 => {
                    const isChecked = <HTMLInputElement>document.getElementById('radio_' + ele.fieldname + '_' + cnt);
                    isChecked.checked = false;
                    cnt++;
                  });
                }
              } else if (ele.fieldtype == 'lookup') {
                $(".selectpicker").selectpicker("refresh");
              } else if (ele.fieldtype == 'list') {

                //Get the text using the value of select
                var text = $("select[name=selValue] option[value='']").text();
                //We need to show the text inside the span that the plugin show
                $('.bootstrap-select .filter-option').text(text);
                //Check the selected attribute for the real select
                $('select[name=selValue]').val();

                $("#" + ele.fieldname).val('');
                $("#" + ele.fieldname).selectpicker("refresh");

              } else {
                $("#" + ele.fieldname).val('');
              }

            });
          });

        }

      } else {

        if(groupValidationArray && groupValidationArray.length !== 0 && this._groupAddedValue[groupname] && this._groupAddedValue[groupname].length !== 0) {

          var groupValidationObj = groupValidationArray.find(p => p.groupname == groupname);

          if(groupValidationObj) {

            if(groupValidationObj.groupvalidation && groupValidationObj.groupvalidation.unique) {

              var uniquefieldname = groupValidationObj.groupvalidation.unique;

              var newUniqueValue = grp[uniquefieldname];

              var gropArrayObj = this._groupAddedValue[groupname].find(p=> p[uniquefieldname] == newUniqueValue && groupStatus !== p.id && newUniqueValue !== 'Daughter' && newUniqueValue !== 'Son');

              if(gropArrayObj) {

                this.showNotification('top', 'right', uniquefieldname + ' field should be unique.', 'danger');
                errorCount++;

                $('#error_group_validation_' + uniquefieldname).html(uniquefieldname + ' field should be unique');

                  setTimeout(() => {
                    $('#error_group_validation_' + uniquefieldname).html('');
                  }, 3000);

              }

            }
          }
        }

        let cnt = 0;
        this._groupAddedValue[groupname].forEach(element => {
          if (element.id == groupStatus) {
            if (cntCheck == emptyCheck) {
              $('#error_' + groupname).show();
              setTimeout(() => {
                $('#error_' + groupname).hide();
              }, 1000);
            } else {

              if (errorCount !== 0) {
                $('#error_' + groupname).show();
                setTimeout(() => {
                  $('#error_' + groupname).hide();
                }, 1000);
              } else {
                this._groupAddedValue[groupname][cnt] = grp;
              let groupStatus = $('#' + groupname).val(0);
              $('#btn_' + groupname).val('Add ' + groupname);


              this._groupLists.forEach(element => {
                element.forEach(ele => {
                  if (ele.fieldtype == 'checkbox') {
                    if (ele.lookupdata.length !== 0) {
                      let cnt = 0;
                      ele.lookupdata.forEach(e1 => {
                        const isChecked = <HTMLInputElement>document.getElementById('check_' + ele.fieldname + '_' + cnt);
                        isChecked.checked = false;
                        cnt++;
                      });
                    }
                  } else if (ele.fieldtype == 'radio') {
                    if (ele.lookupdata.length !== 0) {
                      let cnt = 0;
                      ele.lookupdata.forEach(e1 => {
                        const isChecked = <HTMLInputElement>document.getElementById('radio_' + ele.fieldname + '_' + cnt);
                        isChecked.checked = false;
                        cnt++;
                      });
                    }
                  } else if (ele.fieldtype == 'lookup') {
                    $(".selectpicker").selectpicker("refresh");
                  } else if (ele.fieldtype == 'list') {

                    //Get the text using the value of select
                    var text = $("select[name=selValue] option[value='']").text();
                    //We need to show the text inside the span that the plugin show
                    $('.bootstrap-select .filter-option').text(text);
                    //Check the selected attribute for the real select
                    $('select[name=selValue]').val();

                    $("#" + ele.fieldname).val('');
                    $("#" + ele.fieldname).selectpicker("refresh");

                  } else {
                    $("#" + ele.fieldname).val('');
                  }
                });
              });
              }


            }
          }
          cnt++;
        });
      }
    }

    groupEditClick(grpData: any, groupname: any) {

      $('#btn_' + groupname).val('Edit ' + groupname);

      $('#' + groupname).val(grpData.id);

      this._groupLists.forEach(element => {
        element.forEach(ele => {
          if (ele.groupname == groupname) {
            if (ele.fieldtype == 'checkbox') {
              if (ele.lookupdata.length !== 0) {
                let cnt = 0
                ele.lookupdata.forEach(e1 => {
                  if (grpData[ele.fieldname].length !== 0) {
                    grpData[ele.fieldname].forEach(e2 => {
                      if (e1['key'] == e2) {
                        const isChecked = <HTMLInputElement>document.getElementById('check_' + ele.fieldname + '_' + cnt);
                        isChecked.checked = true;
                      }
                    });
                  }
                  cnt++;
                });
              }
            } else if (ele.fieldtype == 'radio') {
              if (ele.lookupdata.length !== 0) {
                let cnt = 0
                ele.lookupdata.forEach(e1 => {
                  if (e1['key'] == grpData[ele.fieldname]) {
                    const isChecked = <HTMLInputElement>document.getElementById('radio_' + ele.fieldname + '_' + cnt);
                    isChecked.checked = true;
                  }
                  cnt++;
                });
              }
            } else if (ele.fieldtype == 'image') {
              this.groupformImageArray[ele.fieldname] = [];
              this.groupformImageArray[ele.fieldname].push(grpData[ele.fieldname]);

            } else if (ele.fieldtype == 'multi_image') {
              this.groupformImageArray[ele.fieldname] = [];
              this.groupformImageArray[ele.fieldname] = grpData[ele.fieldname];

            } else if (ele.fieldtype == 'attachment') {
              this.groupformImageArray[ele.fieldname] = [];
              this.groupformImageArray[ele.fieldname] = grpData[ele.fieldname];

            } else if (ele.fieldtype == 'gallery') {
              this.groupformImageArray[ele.fieldname] = [];
              this.groupformImageArray[ele.fieldname] = grpData[ele.fieldname];

            } else if (ele.fieldtype == 'list') {

              $('#' + ele.fieldname).val(grpData[ele.fieldname]);
              $("#" + ele.fieldname).selectpicker("refresh");


            } else {
              $('#' + ele.fieldname).val(grpData[ele.fieldname]);
            }

          }
        });
      });



    }

    groupDeleteClick(grpData: any, groupname: any) {

      this.removeLookupfromArray(grpData.id, this._groupAddedValue[groupname]);

      if (this._groupAddedValue[groupname].length == 0) {

        this._groupLists.forEach(ele => {

          if (ele[0]['groupname'] == groupname) {
            ele.forEach(element => {

              let fieldname = element.fieldname;
              let fieldControl = this.dynamicForm.get(fieldname);

              if (element.validationData) {
                if (element.validationData === 'requiredVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([Validators.required]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'emailVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, Validators.email]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([Validators.email]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'urlVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, ValidUrlValidator.insertonlyvalidurl]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([ValidUrlValidator.insertonlyvalidurl]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'onlyNumberVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, OnlyNumberValidator.insertonlynumber]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([OnlyNumberValidator.insertonlynumber]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'mobileNumberVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([ValidMobileNumberValidator.onlyvalidmobilenumber]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'onlyNumberOrDecimalVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, OnlyNumberOrDecimalValidator.insertonlynumberordecimal]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([OnlyNumberOrDecimalValidator.insertonlynumberordecimal]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else if (element.validationData === 'validPercentVal') {
                  if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment' || element.fieldtype == 'gallery') {
                    fieldControl.setValidators([]);
                  } else {
                    if (element.isMandatory == "yes") {
                      fieldControl.setValidators([Validators.required, ValidPercValidator.insertonlyvalidperc]);
                      fieldControl.setErrors({ 'incorrect': true });
                    } else {
                      fieldControl.setValidators([ValidPercValidator.insertonlyvalidperc]);
                      fieldControl.setErrors({ 'incorrect': true });
                    }
                  }
                } else {
                  fieldControl.setValidators([]);
                }
              } else {
                if (element.isMandatory == "yes") {
                  fieldControl.setValidators([Validators.required]);
                } else {
                  fieldControl.setValidators([]);
                }
              }
            });
          }
        });
      }

    }

    removeLookupfromArray(id: number, array: any) {
      for (const i in array) {
        if (array[i].id == id) {
          array.splice(i, 1);
        }
      }
    }

    isValidEmailAddress(emailAddress: any) {
      var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
      return pattern.test(emailAddress);
    }

    validURL(str: any) {
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      return regexp.test(str);
    }

    isANumber(str: any) {
      return !/\D/.test(str);
    }

    isValidMobileNumber(phone: any) {
      var phoneNum = phone.replace(/[^\d]/g, '');
      if (phoneNum.length == 10) { return true; }
    }

    isadultDateVal(date: Date) {

      // var today = new Date();

      // var dateMomentObject = moment(date, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
      // var dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object

      // var birthDate = new Date(dateObject);
      // var age = today.getFullYear() - birthDate.getFullYear();

      // var m = today.getMonth() - birthDate.getMonth();

      // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      //   age--;
      // }

      // if (age <= 18) {
      //   return false;
      // }
      return true;

    }

    insertonlynumberordecimal(value: any) {
      var strCheck = "0123456789";
      var i;

      for (i in value) {
        if (strCheck.indexOf(value[i]) == -1)
          return false;
      }
      return true;
    }

    insertonlyvalidperc(value: any) {
      return (/^\d+(\.\d+)?%$/.test(value));
    }

    convertDate(inputFormat: any) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    }

    removeImg(url: any, filedname: any) {

      for (const i in this.dynamicForm.value[filedname]) {
        if (this.dynamicForm.value[filedname][i] == url['attachment']) {
          this.dynamicForm.value[filedname].splice(i, 1);
        }
      }

      for (const key in this.formImageArray) {
        if (key == filedname) {
          this.formImageArray[key].forEach(element => {
            if (element == url) {
              this.formImageArray[key].splice(element, 1);
            }
          });

        }
      }

      for (const key in this.groupformImageArray) {
        if (key == filedname) {
          this.groupformImageArray[key].forEach(element => {
            if (element == url) {
              this.groupformImageArray[key].splice(element, 1);
            }
          });

        }
      }

      this._sectionLists.forEach(ele => {
        ele.forEach(element => {
          if(element.fieldname == filedname) {
            if(this.formImageArray[filedname].length == 0) {
              element.value = "";
            }
          }
        });
      });




    }

    autocompleListFormatter = (data: any): SafeHtml => {
      let html = `<span>${data.name}  </span>`;
      return html;
    }

    deleteItem() {
      this.deleteobj = {};

      if (this.formsModelValue['gridaction']) {
        this.formsModelValue['gridaction'].forEach(element => {
          if (element.action == 'delete') {
            this.deleteobj = element;
          }
        });
      }

      const temp = this;
      swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this imaginary file!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          customClass:{
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
          },
          buttonsStyling: false
      }).then((result) => {
        if (result.value) {
            temp._commonService
              .commonServiceByUrlMethodIdOrData(temp.deleteobj['actionurl'], temp.deleteobj['method'], temp.bindIdDataValue[0]['_id'], { 'formname': temp.deleteobj['formname'] })
              .subscribe((data: any) => {
                if (data) {
                  var successmessage1 = '';
                  var actionmessage1 = '';
                  if (data.message !== 'DELETED') {
                    actionmessage1 = data.message;
                  }

                  if (data.message === 'DELETED') {
                    successmessage1 = temp.deleteobj.successmessage;
                  }

                  swal.fire({
                    title: actionmessage1,
                    text: successmessage1,
                    icon: 'success',
                    customClass:{
                      confirmButton: "btn btn-success",
                    },
                    buttonsStyling: false
                  });

                  let redirect_url = ['/pages/dynamic-list/list/' + temp.formsModelValue.formname];
                  temp.disabledDirtyForm.emit(redirect_url);
                }
              }, (err) =>{
                console.error("err", err);
              });
          } else {
          swal.fire({
              title: 'Cancelled',
              text: 'Your imaginary file is safe :)',
              icon: 'error',
              customClass:{
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
          });
        }
      })
    }

    noeditpermissionMsg() {

      swal.fire({
        title: "No Permission",
        text: "You have no edit permission for this form.",
        timer: 2000,
        showConfirmButton: false
      });
    }

    downloadlink(link: any) {
      window.open(link, '_blank');
      return true;
    }

    wfapprovalprocess() {

      this.isdisablesavebutton = true;

      if(this.wfpermission == "approver") {
        this.bindIdDataValue.wfstatus = "approved";
      } else {
        this.bindIdDataValue.wfstatus = "reviewed";
      }

      this.bindIdDataValue.role = this.bindIdDataValue.role['_id'] ? this.bindIdDataValue.role['_id'] : this.bindIdDataValue.role;

      const varTemp = this;
      swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this imaginary file!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          customClass:{
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
          },
          buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          let url = varTemp.formsModelValue.editurl['url'].replace(':_id', '');
          let method = varTemp.formsModelValue.editurl['method'];

          varTemp._commonService
            .commonServiceByUrlMethodData(url, method, varTemp.bindIdDataValue[0], varTemp.bindIdDataValue[0]['_id'])
            .subscribe( data => {
              if(data){

                varTemp.isdisablesavebutton = false;
                varTemp.showNotification('top', 'right', 'Records has been Updated Successfully!!!', 'success');
                varTemp._router.navigate(['/pages/admins/automation/workflow/approval-lists']);
              }
          }, (err) =>{
            console.error("err", err);
          });
        } else {
          swal.fire({
              title: 'Cancelled',
              text: 'Your imaginary file is safe :)',
              icon: 'error',
              customClass:{
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
          });
        }
      })
    }

    onSubmit(value: any, isValid: boolean) {
      this.submitted = true;
      if (!isValid) {
          return false;
      } else {

          this.isdisablesavebutton = true;
          this.bindIdDataValue.wfstatus = "rejected";
          if(!this.bindIdDataValue['property']) {
            this.bindIdDataValue['property'] = {};
          }
          this.bindIdDataValue['property']['wfreason'] = this.reason;

          this.bindIdDataValue.role = this.bindIdDataValue.role['_id'] ? this.bindIdDataValue.role['_id'] : this.bindIdDataValue.role;


          const varTemp = this;


          swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this imaginary file!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            customClass:{
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            let url = varTemp.formsModelValue.editurl['url'].replace(':_id', '');
            let method = varTemp.formsModelValue.editurl['method'];

            varTemp._commonService
              .commonServiceByUrlMethodData(url, method, varTemp.bindIdDataValue[0], varTemp.bindIdDataValue[0]['_id'])
              .subscribe( data => {
                if(data){

                  varTemp.isdisablesavebutton = false;
                  varTemp.showNotification('top', 'right', 'Records has been Updated Successfully!!!', 'success');
                  varTemp._router.navigate(['/pages/admins/automation/workflow/approval-lists']);
                }
            }, (err) =>{
              console.error("err", err);
            });
          } else {
            swal.fire({
                title: 'Cancelled',
                text: 'Your imaginary file is safe :)',
                icon: 'error',
                customClass:{
                  confirmButton: "btn btn-info",
                },
                buttonsStyling: false
            });
          }
        })
      }
    }

    closePopup() {
      this.form.reset();
    }

    onItemAdded(itemToBeAdded: any) {
      
    }

    getContactsFormGroup(fields: any, index: any): FormGroup {
      this.arr = this.form.get(fields.fieldname) as FormArray;
      const formGroup = this.arr.controls[index] as FormGroup;
      return formGroup;
    }
    

}
