import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParseDataService {

  parseName(name: string){
    const regex = /CN=([^/]+)/;
    const match = regex.exec(name);
    if (match && match.length > 1) return match[1];
    return '';
  }

  parseDate(date: string){
    const year = "20" + date.slice(0, 2);
    const month = date.slice(2, 4);
    const day = date.slice(4, 6);
    return `${year}-${month}-${day}`;
  }
}
