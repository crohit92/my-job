import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  private encode(value:any){
    if (value == null || value.length === 0) {
        return "";
    }
    //if object
    if(typeof(value) == typeof({})){
        value = JSON.stringify(value);
    }
    return btoa(value);
}

private decode(value:any){
    if (value == null || value.length === 0) {
        return null;
    }
    return JSON.parse(atob(value));
}

private normalize(key:string){
    return key.toLowerCase();
}

public get(key:string){
    return this.decode(localStorage.getItem(this.encode(this.normalize(key))));
}

public set(key:string,data:any){
    localStorage.setItem(
        this.encode(this.normalize(key)),
        this.encode(data)
    );
}

public remove(key:string){
    localStorage.removeItem(this.encode(this.normalize(key)))
}

public clear(...exceptKeys:string[])
{
    let data = {};
    exceptKeys.forEach(key => {
        data[key] = localStorage.getItem(this.encode(this.normalize(key)));
    });
    localStorage.clear();
    exceptKeys.forEach(key => {
       localStorage.setItem(this.encode(this.normalize(key)), data[key]);
    });
}

}
