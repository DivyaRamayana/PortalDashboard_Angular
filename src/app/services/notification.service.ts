import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

const defaultOption = {
  positionClass: 'toast-top-center',
  // preventDuplicates: true
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private toastr: ToastrService
  ) { }

  showSuccess(title: string, desc: string, options = defaultOption) {
    this.toastr.success(desc, title, options);
  }
  showError(title: string, desc: any, options = defaultOption) {
    this.toastr.error(desc.message ? desc.message : desc, title, options);
  }
  showInfo(title: string, desc: string, options = defaultOption) {
    this.toastr.info(desc, title, options);
  }
  showWarning(title: string, desc: string, options = defaultOption) {
    this.toastr.warning(desc, title, options);
  }
}
