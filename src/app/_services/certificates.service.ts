import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Certificate } from './../_interfaces/certificate';

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  private currentCertificatesSource = new BehaviorSubject<Certificate[] | null>(null);
  currentCertificates$ = this.currentCertificatesSource.asObservable();

  setCurrentCertificates(certificates: Certificate[]){
    this.currentCertificatesSource.next(certificates);
  }

  updateCertificates(currentCertificates: Certificate[], newCertificate: Certificate){
    const update = [...currentCertificates, newCertificate];
    localStorage.setItem('certificates', JSON.stringify(update));
    this.currentCertificatesSource.next(update);
  }
}
