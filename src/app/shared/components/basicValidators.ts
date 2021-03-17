import { FormControl, FormGroup } from '@angular/forms';

export class BasicValidators {
    static email(control: FormControl) {
        var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var valid = regEx.test(control.value);
        
        if(control.value) {
            return valid ? null : { email: true };
        } else {
            return null;
        }
    }
}

export class ValidMobileNumberValidator {
    static onlyvalidmobilenumber(control: FormControl) {
        //var regex = /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/;
        var regex = /^[1-9]{1}[0-9]{9}$/
        var valid = regex.test(control.value);
        if(control.value != undefined && control.value != null && control.value.length > 10){
            valid = false;
        }
        if(control.value) {
            return valid ? null : { onlyvalidmobilenumber: true };
        } else {
            return null;
        }
        
    }
}

export class OnlyPositiveNumberValidator {
    static insertonlypositivenumber(control: FormControl) {
        var regex = /^[0-9]*(?:\.\d{1,2})?$/;
        var valid = regex.test(control.value);
        
        if(control.value) {
            if(control.value <= 0) {
                return { insertonlypositivenumber: true };
            } else {
                return valid ? null : { insertonlypositivenumber: true };
            }
        } else {
            return null;
        }
    }
}

export class OnlyNumberValidator {
    static insertonlynumber(control: FormControl) {
        var regex = /^[0-9]*(?:\.\d{1,2})?$/;
        var valid = regex.test(control.value);
        if(control.value) {
            return valid ? null : { insertonlynumber: true };
        } else {
            return null;
        }
    }
}

export class OnlyNumberOrDecimalValidator {
    static insertonlynumberordecimal(control: FormControl) {
        var regex = /^[0-9]+([,.][0-9]+)?$/g;
        var valid = regex.test(control.value);
        if(control.value) {
            return valid ? null : { insertonlynumberordecimal: true };
        } else {
            return null;
        }
    }
}


export class ValidUrlValidator {
    static insertonlyvalidurl(control: FormControl) {
        if (control.value) {
            var urltype;

            if (control.value.startsWith('http://'))
                urltype = 'http://';
            if (control.value.startsWith('https://'))
                urltype = 'https://';

            if (urltype) {
                var str = control.value.split(urltype);
                var regex = /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/;
                var valid = regex.test(str[1]);

                if (valid == true) {
                    if (str[1]) {
                        var strurl = str[1].split('.');

                        var resstrurl;
                        if (str[1].startsWith('www.'))
                            resstrurl = strurl[2];
                        else
                            resstrurl = strurl[1];

                        if (resstrurl) {
                            var strpage = resstrurl.split('/');

                            if (strpage[0].length == 2 || strpage[0].length == 3)
                                return null;
                            else
                                return { insertonlyvalidurl: true };
                        }
                        else
                            return { insertonlyvalidurl: true };
                    }
                    else
                        return { insertonlyvalidurl: true };
                }
                else {
                    return { insertonlyvalidurl: true };
                }
            }
            else {
                return { insertonlyvalidurl: true };
            }
        }
        else
            return null;
    }
}

export class ValidPercValidator {
    static insertonlyvalidperc(control: FormControl) {
        if (control.value) {
            if (control.value <= 100)
                return null;
            else
                return { insertonlyvalidperc: true };
        }
        else
            return null;
    }
}

export function equalValidator({value}: FormControl): { [key: string]: any } {
    const [first, ...rest] = Object.keys(value || {});
    const valid = rest.every(v => value[v] === value[first]);
    return valid ? null : { equalValidator: true };
}

export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): { [key: string]: any } => {
        let password = group.controls[passwordKey];
        let confirmPassword = group.controls[confirmPasswordKey];

        if (password.value !== confirmPassword.value) {
            return {
                mismatchedPasswords: true
            };
        }
    }
}

