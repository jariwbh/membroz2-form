import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../../shared/components/basicValidators';

import { BaseLiteComponemntComponent } from '../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { NgxSignaturePadComponent, SignaturePadOptions } from "@o.krucheniuk/ngx-signature-pad";

declare const $: any;
@Component({
  selector: 'app-document-field-value',
  templateUrl: './document-field-value.component.html',
  styles: [
  ]
})
export class DocumentFieldValueComponent extends BaseLiteComponemntComponent implements OnInit {

  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  minDate: Date;
  maxDate: Date;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  uploader: FileUploader;
  response: any[] = [];
  private title: string;
  customeUploader: any[] = [];
  maxFileSize = 5 * 1024 * 1024;
  formImageArray: any[] = [];

  @Output() childSubmitData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("testPadTest", { static: false }) signaturePadElement: NgxSignaturePadComponent;

  config: SignaturePadOptions = {
    minWidth: 1,
    maxWidth: 10,
    penColor: "blue"
  };

  display: boolean = false;
  startDate: Date;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private cloudinary: Cloudinary,
    private changeDetectorRef: ChangeDetectorRef
  ) { 
    super()
  }

  @Input() formfield: any;
  @Input() formfielValue: any;
  
  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.makeForm()
      await this.fillValue()
      await this.imageConfigration();
    } catch (error) {
    } finally {
      const currentYear = new Date().getFullYear();
      this.minDate = new Date(currentYear - 100, 0, 1);
      this.maxDate = new Date(currentYear + 100, 11, 31);
    }
  }

  ngAfterViewInit() {
    if(this.formfield.fieldtype == "signaturepad") {
        
      setTimeout(() => {
        this.display = true;
        this.changeDetectorRef.detectChanges();
      }, 1000);
    }
  }

  async makeForm() {
      
    const group: any = {};
    
    if (this.formfield.fieldtype == 'checkbox') {
      group[this.formfield.fieldname] = new FormControl([])
    } else if (this.formfield.fieldtype == 'readonly') {
      group[this.formfield.fieldname] = new FormControl(this.formfield.defaultvalue);
    } else if (this.formfield.fieldtype == 'primaryemail' || this.formfield.fieldtype == 'secondaryemail') {

      if (this.formfield.required == "yes") {
        group[this.formfield.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
      } else {
        group[this.formfield.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
      }

    } else {
      
      if (this.formfield.required) {
        group[this.formfield.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
      } else {
        group[this.formfield.fieldname] = new FormControl(null);
      }
      
    }

    this.dynamicForm = this.fb.group(group);
    return;
  }

  async fillValue() {
    if(this.formfielValue && this.formfielValue["property"][this.formfield.fieldname] && this.formfield.fieldname) {
      this.dynamicForm.controls[this.formfield.fieldname].setValue(this.formfielValue["property"][this.formfield.fieldname]);
    }
    return;
  }

  onDynamicFormSubmit(value: any, isValid: boolean) {

    this.dynamicSubmitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Validation failed!!!', 'danger');
      return false;
    } else {

      if ( this.formfield.fieldtype == 'attachment' || this.formfield.fieldtype == 'gallery') {
        for (let key in this.formImageArray) {
          if (key == this.formfield.fieldname) {
            this.dynamicForm.value[this.formfield.fieldname] = this.formImageArray[key];
          }
        }
      } else if(this.formfield.fieldtype == 'lookup' || this.formfield.fieldtype == 'form') {
        
        if(this.dynamicForm.value[this.formfield.fieldname] && this.dynamicForm.value[this.formfield.fieldname]["autocomplete_id"]) {
          var autocomplete_displayname = this.dynamicForm.value[this.formfield.fieldname]["autocomplete_displayname"]
          var autocomplete_id = this.dynamicForm.value[this.formfield.fieldname]["autocomplete_id"]
          this.dynamicForm.value[this.formfield.fieldname] =  {}
          this.dynamicForm.value[this.formfield.fieldname] =  {
            autocomplete_displayname: autocomplete_displayname,
            autocomplete_id: autocomplete_id
          }
        } else {
          this.dynamicForm.value[this.formfield.fieldname] = "";
        }
      } else if (this.formfield.fieldtype == 'signaturepad') {
        if(!this.signaturePadElement.isEmpty()) {
          this.dynamicForm.value[this.formfield.fieldname] = this.signaturePadElement.toDataURL();
        } else {
          for (let key in this.formImageArray) {
            if (key == this.formfield.fieldname) {
              var last = this.formImageArray[key].length - 1;
              this.dynamicForm.value[this.formfield.fieldname] = this.formImageArray[key][last]['attachment'];
            }
          }
        }
      }
      
      //console.log("this.dynamicForm.value", this.dynamicForm.value);
      this.childSubmitData.emit(this.dynamicForm.value);
    }
  }

  async imageConfigration() {

    if (this.formfield.fieldtype == "attachment" || this.formfield.fieldtype == "gallery" || this.formfield.fieldtype == "signaturepad") {

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
      };

      if(this.formfield.fieldtype == 'gallery' || this.formfield.fieldtype == "signaturepad") {
        uploaderOptions.allowedFileType = ['image']
      }

      let fieldname = this.formfield.fieldname;
      this.customeUploader[fieldname] = new FileUploader(uploaderOptions);

      this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {
        form.append('upload_preset', this.cloudinary.config().upload_preset);
        let tags = this.formfield.fieldname;

        if (this.title) {
          form.append('context', `photo=${this.formfield.fieldname}`);
          tags = this.formfield.fieldname;
        }
        form.append('tags', tags);
        form.append('file', fileItem);

        fileItem.withCredentials = false;
        return { fileItem, form };
      };

      const upsertResponse = fileItem => {

        $(".loading_" + this.formfield.fieldname).show();

        if (fileItem && fileItem.status == 200) {

          let fieldnameTags = fileItem.data.tags[0];

          if (!this.formImageArray[fieldnameTags]) {
            this.formImageArray[fieldnameTags] = [];
          }

          if (!this.formfield.value) {
            this.formfield.value = "";
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

          this.formImageArray[fieldnameTags].push(fileInfo);

          this.formfield.value = fileItem.data.secure_url;

          $('#' + fieldnameTags).val(fileItem.data.secure_url);

          $(".loading_" + this.formfield.fieldname).hide();

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
                message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(this.formfield.maxfilesize ? this.formfield.maxfilesize : (Number(this.maxFileSize) * 1024 * 1024));
                this.showNotification("top", "right", message, "danger");
                break;
              default:
                message = 'Error trying to upload file '+item.name;
                this.showNotification("top", "right", message, "danger");
                break;
            }
          };
    }

    return;
  }

  formatBytes(bytes: any, decimals? : any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
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
    
    if(this.formfield.fieldname == filedname) {
      if(this.formImageArray[filedname].length == 0) {
        this.formfield.value = "";
      }
    }

  }

  clear() {
    this.signaturePadElement.clear();
    this.dynamicForm.value[this.formfield.fieldname] = "";
    this.formfield.value = "";
  }

  getImage() {
    console.log(this.signaturePadElement.toDataURL());
  }

  changeConfig() {
    this.config.penColor = Math.random() >= 0.5 ? "black" : "red";
    this.config.maxWidth = Math.random() * 10;
    this.config = Object.assign({}, this.config);
  }

  isInValid(): boolean {
    return !(this.signaturePadElement && !this.signaturePadElement.isEmpty());
  }

  forceReload() {
    this.signaturePadElement.forceUpdate();
  }

  onItemAdded(itemToBeAdded: any) {
    // console.log('Item to be added: ', itemToBeAdded);
  }

}
