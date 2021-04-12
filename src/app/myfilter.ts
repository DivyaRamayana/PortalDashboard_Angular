import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'myfilter'
})
export class MyFilterPipe implements PipeTransform {
    transform(items: any[], filter: Object): any {
 
        if(filter == 1){
          return items.slice(0, 2);
        }else if(filter == 2){
          return items.slice(0, 3);
        }else if(filter == 3){
          return items;
        }else{
          return [];
        }
    }
}