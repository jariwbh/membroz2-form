import { ValidatorFn, AbstractControl } from '@angular/forms';
import { FormControl, FormGroup } from '@angular/forms';

import * as moment from 'moment';

export class overEighteen {
  static overEighteen (control: FormControl) {
    const dob = control.value;

    const today = moment().startOf('day');
    const delta = today.diff(dob, 'years', false);

    if(control.value) {

      if (delta <= 18) {
        return {
          adultDateVal: {
            'requiredAge': '18+',
            'currentAge': delta
          }
        };
      } 
      
  
      return null;

    } else {
      return null;
    }
    
  };
}
