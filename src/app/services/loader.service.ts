import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
public currentValue: Observable<any>;
constructor() {
    this.currentValue = this.status.asObservable();
}
public display(value: boolean) {

    this.status.next(value);
}
}
