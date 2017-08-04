import {Input,Component} from '@angular/core';
@Component({
    templateUrl:'./customer.html',
    selector:'customer'
})
export class CustomerComponent{
    @Input('customer') customer:any;
}