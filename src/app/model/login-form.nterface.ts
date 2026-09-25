import { FormControl } from '@angular/forms';

export default interface LoginFormInterface {
  email: FormControl<string>;
  password: FormControl<string>;
}
