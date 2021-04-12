import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DailylogService {
  URL = "http://localhost:5000/"
  constructor(private httpClient: HttpClient) {

  }
  getdailylogs(portal,  from_date): any {
    return this.httpClient.get(this.URL + "readcsv/" + portal +"/"+from_date +"/" +from_date);
  }

  updatedailylogs(data): any {
    return this.httpClient.put(this.URL + "writecsv", data);
  }

  manualRun(portal): any {
    return this.httpClient.get(this.URL + "Runbat/" + portal );
  }

  loadConfig(): any {

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'text/xml');

    return this.httpClient.get('assets/Config/Config_xmlfile.xml', { headers, responseType: 'text' })
     
  }
}
