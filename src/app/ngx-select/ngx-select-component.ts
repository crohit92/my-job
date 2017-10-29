import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";

@Component({
    selector: 'ngx-select',
    exportAs: 'ngxSelect',
    templateUrl: './ngx-select.html',
    styleUrls:['./ngx-select.css']
})
export class NgxSelectComponent implements OnInit,OnChanges{
    
    _displayValue: string;
    optionsVisible: boolean;
    selectedItem: any;
    
    //initial value whic user wants to be preselected in the autocomplete
    @Input('initialValue') initialValue: any;
    //placeholder text for the component
    @Input('placeholder') placeholder:string;
    
    //Property name to be used to select the initial
    //value from the options. This property is to be read from 
    //initialValue and matched against each value in the
    //options array
    @Input('initialValueMatchByProperty') initialValueMatchByProperty: string;
    //array of options to be displayed in the autocomplete
    @Input('options') options: any[];
    //property to display of the selected option
    @Input('displayProperty') displayProperty: string;
    //event emitter providing the selected value
    @Output('onSelect') onSelect: EventEmitter<any> = new EventEmitter<any>();
    
    constructor() {
        
    }
    
    ngOnInit(): void {
        this.selectedItem = this.initialValue;
        this.showSelectedItem();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        this.selectedItem = this.initialValue;
        this.showSelectedItem();
    }
    
    private showSelectedItem() {
        if (this.displayProperty && this.selectedItem && this.selectedItem.hasOwnProperty(this.displayProperty)) {
            this._displayValue = this.selectedItem[this.displayProperty];
        }
        else if (this.options.length > 0 &&
            this.selectedItem &&
            !this.selectedItem.hasOwnProperty(this.displayProperty) &&
            this.selectedItem.hasOwnProperty(this.initialValueMatchByProperty)) {
                for (var index = 0; index < this.options.length; index++) {
                    var option = this.options[index];
                    if (option[this.initialValueMatchByProperty] == this.selectedItem[this.initialValueMatchByProperty]) {
                        this.selectedItem = option;
                        break;
                    }
                }
            }
            else {
                this._displayValue = this.selectedItem ? this.selectedItem : '';
            }
        }
        
        public itemClicked(ev,item) { 
            this.selectedItem = item;
            this.showSelectedItem()
            this.onSelect.emit(item);
            this.hideOptions(ev);
        }
        
        showOptions(ev){
            this.optionsVisible = true;
            ev.stopPropagation();
        }
        
        hideOptions(ev){
            this.optionsVisible = false;
            ev.stopPropagation();
        }
    }