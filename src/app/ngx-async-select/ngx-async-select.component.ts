import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Api } from '../helper/api';

/**
 * USE CASE
 * 1. TO select an item from a list of items
 * The motivation behind this component is that
 * many times, an autocomplete is required which should have preselect capabilities
 * i.e. user can search for items and as user types, an XHR is sent to the backend api
 * with some optional query params and route params.
 * 
 * 2. To display data 
 * In this case the autocomplete is used to show an item using the 
 * a. Display field
 * 
 * autocomplete has two main properties
 * a. Display fields: Used to display item which is selected by the user
 */
@Component({
    selector: 'ngx-async-select',
    exportAs: 'ngxAsyncSelect',
    templateUrl: './ngx-async-select.component.html',
    styleUrls: ['ngx-async-select.component.css']
})
export class NgxAsyncSelectComponent implements OnChanges {
    @ViewChild('search') searchBar: ElementRef;
    @Input() placeholder: string;
    @Input() displayProperties: string[];
    @Input() apiPath?: string;
    @Input() endpoint?: string;
    @Input() queryParams?: { [key: string]: number | string | Date };
    @Input() routeParams?: { [key: string]: number | string };
    @Input() qpKeyForFilter: string;
    @Input() initialSelectedItem?: any;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();

    items: any[];
    selectedItem: any;
    optionsVisible = false;
    constructor(private api: Api) {

    }

    ngOnChanges(change: SimpleChanges): void {
        if (change.initialSelectedItem && change.initialSelectedItem.currentValue !== change.initialSelectedItem.previousValue) {
            this.selectedItem = change.initialSelectedItem.currentValue;
            this.showSelectedItem();
        }
    }




    private loadItems(ev: KeyboardEvent) {
        if (ev.keyCode === 13) {
            const searchText = (ev.target as HTMLInputElement).value;
            if (searchText) {
                const filter = {};
                filter[this.qpKeyForFilter] = searchText;
                this.api.sendRequest({
                    method: 'get',
                    apiBase: this.apiPath,
                    endpoint: this.endpoint || '',
                    queryParams: { ...this.queryParams, ...filter },
                    routeParams: this.routeParams
                }).subscribe(res => {
                    this.items = res as any[];
                    this.showOptions();
                });
            }
        } else if (ev.keyCode === 8 || ev.keyCode === 127) {
            this.selectedItem = {};
            this.showSelectedItem();
            this.onSelect.emit(this.selectedItem);
        }


    }

    showOptions(ev?) {
        this.optionsVisible = true;
        if (ev) {
            ev.stopPropagation();
        }

    }

    hideOptions(ev) {
        this.optionsVisible = false;
        ev.stopPropagation();
    }

    itemClicked(ev, item) {
        this.selectedItem = item;
        this.showSelectedItem();
        this.onSelect.emit(item);
        this.hideOptions(ev);
    }

    showSelectedItem() {
        const getSelectedItemText = () => {
            let text = '';
            for (const key of this.displayProperties) {
                if (this.selectedItem.hasOwnProperty(key)) {
                    text += `${this.selectedItem[key]} `;
                }
            }
            return text;
        };
        (this.searchBar.nativeElement as HTMLInputElement).value = getSelectedItemText();
    }

}
