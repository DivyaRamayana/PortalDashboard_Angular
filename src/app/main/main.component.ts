import { Component, OnInit,ViewEncapsulation  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common'
import xml2js from 'xml2js';
// import { DailylogService}  from '../services/dailylog.service'; 
import { MyFilterPipe } from '../myfilter';
// import * as fs from 'fs'
import { DomSanitizer } from '@angular/platform-browser';
import { DailylogService } from '../services/dailylog.service';
import { Quote } from '@angular/compiler';
import { NotificationService } from '../services/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { exception } from 'console';
import {NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';

// import { saveAs } from 'file-saver'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  encapsulation:ViewEncapsulation.None,
  providers: [NgbPaginationConfig]

})
export class MainComponent implements OnInit {
  model;

  pipeFilter = '';
  pipeFilterData: any[] = [];

  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  portal = 'khs';

  page = 1;
  p:number = 1;
 
  pageSize = 15

  time = '-'
  Directorypath = '';
  headerlist = []
  status='Success'
  // SAPOrdernumber :string;
  // orderConfirmDate: any;
  // comments: string;
  public xmlItems: any;


  modallogdata: String;
  closeResult: string;
  //assets\csv\KHS\Run\07062020\Data  
  base_csv_path = "./assets/"+ this.portal;
  // base_csv_path = "E:/Pratibha/Rexnord/Portal_Automation";
  csvUrl: string = './assets/csv/07062020_Dailylogs.csv';  // URL to web API
  csvData: any[] = [];

  full_response = []
  selected_date = ''
  name = 'NGX-UI-LOADER';
  maxDates
  
  constructor(
    private http: HttpClient,
    private spinner: NgxUiLoaderService,

    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private dailylogservice: DailylogService,
    private notificationService: NotificationService,
    public datepipe: DatePipe,
    private sanitizer: DomSanitizer) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getToday();
    let current = new Date();
    this.maxDates = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),

    };

  }


  ngOnInit(): void {
    // this.notificationService.showSuccess("Save successfully", "Update Log");
    this.getCsvs();

    // this.showModalData();
    this.loadXML();
  }

  getCsvs() {
this.csvData =[];
    // this.spinner.start();
    this.selected_date = this.datepipe.transform(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), 'ddMMyyyy')
    // let to_date = this.datepipe.transform(new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day), 'ddMMyyyy')
    this.dailylogservice.getdailylogs(this.portal, this.selected_date).subscribe((response: any) => {

      this.full_response = JSON.parse(JSON.stringify(response));
      let files = []
      response.data.forEach(f => {
        f.details.forEach(el => {
          let d = el['Order confirm Date']
          if (this.time == "-" || String(el['Time']).search(this.time) == 0) {
            try {
              if (d && d.length > 0) { //31072020
                el['confirm_Date'] = new Date(Number(d.substring(4, 8)), Number(d.substring(2, 4)) - 1, Number(d.substring(0, 2)))
              }
            }
            catch (Error) {
            }
            files.push(el)
          }
        });
        debugger;
        this.csvData = files;
       
        this.spinner.stop();



      });
    },
      error => {
        this.spinner.stop();
        this.notificationService.showError("Error", "Internal server error");
      });
  }


  onClear() {
    this.full_response;
    let bck = JSON.parse(JSON.stringify(this.full_response));
    this.csvData = [];
    
    let files = [];    
    this.full_response['data'].forEach(f => {
      f.details.forEach(el => {
        let date = el['Order confirm Date']
        if (this.time == "-" || String(el['Time']).search(this.time) == 0) {
          try {
            if (date && date.length > 0) { //31072020
              el['confirm_Date'] = new Date(Number(date.substring(4, 7)), Number(date.substring(2, 3)) - 1, Number(date.substring(0, 2)) - 1)
            }
          }
          catch (Error) {
          }
          files.push(el)
        }
      });

      this.csvData = JSON.parse(JSON.stringify(files));

    });
    this.full_response = bck;
  }

  open(content) {
    this.modallogdata="";
    this.showModalData()
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  showModalData() {
    // this.selected_date = this.datepipe.transform(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), 'ddMMyyyy')
    let date = this.datepipe.transform(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), 'ddMMyyyy')
    // let logurl = this.base_csv_path + "/Run/" + date + "/Logs/" + "Logging.log";
    let logurl = "/assets/"+ this.portal + "/Run/" + date + "/Logs/" + "Logging.log";

    let data = this.http.get(logurl, { responseType: 'text' }).subscribe(data => {
      this.modallogdata = data;
      console.log(data)
    });

  }
  getInvoiceUrl(pdf_file) {
    // let sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl('file:///' + pdf_file);
    if (!pdf_file) {
      return ''
    }

    pdf_file = pdf_file.split("\\");
    let file = pdf_file[pdf_file.length - 1];

    let date = this.datepipe.transform(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), 'ddMMyyyy');
    let pdfUrl = "/assets/"+ this.portal + "/Run/" + date + "/Data/" + file;
    // let pdfUrl = "/assets/KHS"+ "/Run/" + date + "/Data/" + file;
    // let sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl('file:///' + pdfUrl);
    return pdfUrl;

    // window.open(pdfUrl, '_blank');
    // /assets/KHS/Run/04082020/KHS_04082020_1531_ZMEOORD49_0045195681.pdf
  }

  saveData() {
    // this.spinner.start();
    let bck = JSON.parse(JSON.stringify(this.csvData));
    this.full_response['data'].forEach(f => {
      // if (f.path && f.path.includes(this.selected_date)) {
      bck.forEach(el => {
        delete el.edit;
        let date = el['confirm_Date']
        try {
          if (date) {
            el['Order confirm Date'] = this.datepipe.transform(new Date(date.year, date.month - 1, date.day), 'ddMMyyyy')
          }
        }
        catch (Error) {

        }
        delete el.confirm_Date;
      });

      f.details = bck;

      // }
    });
    this.dailylogservice.updatedailylogs(this.full_response).subscribe((response: any) => {
      this.notificationService.showSuccess("Saved successfully", "Record updated");

      this.getCsvs();
    },
      error => {
        this.spinner.stop();
        this.notificationService.showError("Error", "Update failed")


      });
  }

  callAfterManualRun() {
    this.fromDate = this.calendar.getToday();
    this.getCsvs();
    this.notificationService.showSuccess("Success", "Manual run is completed.")

  }
  
  manualRun() {
    this.spinner.start();
    let timeout= 70000;
    if (this.portal =='khs'){
      timeout= 50000;
    }
    let manualRunSuccecss = true;
    this.dailylogservice.manualRun(this.portal).subscribe((response: any) => {
      console.log(response);
      this.getCsvs();
    },
      error => {
        this.spinner.stop();
        this.notificationService.showError("Update failed", "Error")
        manualRunSuccecss = false;

      });
    let self = this;
    if (manualRunSuccecss) {
      setTimeout(() =>
        self.callAfterManualRun(),
        timeout
        );
    }

  }

  getDate(datestr) {
    let date = this.datepipe.transform(datestr, 'ddMMyyyy')
    return date;
  }




  loadXML() {
    let xml_data = this.dailylogservice.loadConfig().subscribe((response: any) => {
      console.log(response)
      this.parseXML(response)
        .then((data) => {
          this.xmlItems = data;
          console.log(this.xmlItems)
        });

    });

  }
  parseXML(data) {
    return new Promise(resolve => {
      var k: string | number,
        arr = [],
        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });
      parser.parseString(data, function (err, result) {
        var obj = result.Portals_Config;
        for (k in obj.Portal) {
          var item = obj.Portal[k];
          arr.push({
            name: item.Name[0],
            Status: item.Status[0],
            Runjobpath: item.Runjobpath[0],
            Destination_Dir: item.Destination_Dir[0]
          });
        }
        resolve(arr);
      });
    });
  }

}

/* old code*/
// callBatFile() {
//   let batfileurl = "E:/Pratibha/Rexnord/Test_Portal_Automation.bat";

//   return batfileurl;

// }


   // Object.keys(response).forEach(key => {
      //   file_len= file_len +  1; // key - value
      // })

      // for (let i = 0; i < response.data; i++) {
      //   let file= response[i]
      //   Object.keys(file).forEach(key => {
      //      file[key].forEach(f => {
      //       if(key.includes(date))  
      //         files.push(f);
      //      });
      //      console.log(key , "---", file[key])
      //   })
      // }

//build a URL and return as per filter
  // getCsvURL(): string {
    // let latest_date =this.datepipe.transform(new Date(this.fromDa te), 'ddmmyyyy');


  //   // let date = "07062020"

  //   let url = this.base_csv_path + this.portal + "/Run/" + date + "/Data/" + date + "_Dailylogs.csv";
  //   return url;
  // }

  // readCsvData() {
  //   // this.http.get(this.csvUrl)

  //   let csvurl = this.getCsvURL()
  //   console.log("Loading date from this url: ", csvurl)

  //   this.http.get(csvurl, { responseType: 'text' })
  //     .subscribe(
  //       data => {
  //         // let csvData = data; //['_body'] || '';
  //         // let allTextLines = csvData.split(/\r?\n|\r/);

  //         let lines = data.split("\n");

  //         let result = [];

  //         let headers = lines[0].split(",");
  //         this.headerlist = headers;
  //         for (let i = 1; i < headers.length; i++) {
  //           headers[i] = String(headers[i]).replace(/\s/g, "");
  //         }

  //         console.log(headers)

  //         for (let i = 1; i < lines.length; i++) {

  //           let obj = {};
  //           let currentline = lines[i].split(",");

  //           for (let j = 0; j < headers.length; j++) {
  //             obj[headers[j]] = currentline[j];
  //           }
  //           if (this.time == "-" || String(obj['Time']).search(this.time) == 0) {
  //             result.push(obj);
  //           }

  //         }

  //         this.csvData = result;
  //         console.log(result);


  //       },

  //       error => {
  //         this.csvData = []
  //         console.log(error);
  //       }
  //     );

  // }

  // saveData() {

    // console.log(this.csvData)
    // let objArray = this.csvData;
    // let headerList = this.headerlist

    // let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    // let jsontocsvData = '';
    // let row = 'S.No,';
    // for (let index in headerList) {
    //   row += headerList[index] + ',';
    // }
    // row = row.slice(0, -1);
    // jsontocsvData += row + '\r\n';
    // for (let i = 0; i < array.length; i++) {
    //   let line = (i + 1) + '';
    //   for (let index in headerList) {
    //     let head = headerList[index];
    //     line += ',' + array[i][head];
    //   }
    //   jsontocsvData += line + '\r\n';
    // }

    // console.log(jsontocsvData);

    // var a = document.createElement('a');
    // var blob = new Blob([jsontocsvData], { type: 'text/csv' }),

    // url = window.URL.createObjectURL(blob);

    // a.href = url;
    // a.download = "myFile.csv";
    // a.click();
    // window.URL.revokeObjectURL(url);
    // a.remove();

//   }

// }

