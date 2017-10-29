import { PipeTransform, Pipe } from "@angular/core";

@Pipe({
    name: 'filterOptions'
})
export class NgxSelectFilterOptions implements PipeTransform {
    transform(options: any[], displayProperty: string, filterText: string) {
        if (!filterText) { return options; }
        if(options.length>0){
            if (displayProperty) {
                return options.filter(option => {
                    if (option.hasOwnProperty(displayProperty)) {
                        return option[displayProperty].toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                    }
                    else {
                        return false;
                    }
                })
            }
            else {
                return options.filter(option => {
                    return option.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                })
            }
        }
        else{
            return options;
        }
        
    }

}