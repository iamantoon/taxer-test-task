import { Component, OnInit } from '@angular/core';
import { CertificatesService } from './_services/certificates.service';
import { ParseDataService } from '../app/_services/parse-data.service';
import { take } from 'rxjs';
import * as forge from 'node-forge';
import * as X509 from 'jsrsasign';
import { Certificate } from './_interfaces/certificate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  addMode = false;
  certificates: Certificate[] = [];
  beingParsedCertificate?: Certificate;

  constructor(private parseService: ParseDataService, public certificatesService: CertificatesService){}

  ngOnInit(): void {
    this.setCurrentCertificates();
    this.addEventListeners();
  }

  setCurrentCertificates(){
    const certificatesString = localStorage.getItem('certificates');
    if (!certificatesString) return;
    const certificates: Certificate[] = JSON.parse(certificatesString);
    this.certificatesService.setCurrentCertificates(certificates);
  }

  changeMode(){
    this.addMode = !this.addMode;
  }
  
  addEventListeners() {
    const dropZone = document.getElementById('drop_zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone?.addEventListener(eventName, this.preventDefaults, false);
    });

    dropZone?.addEventListener('drop', this.handleDrop.bind(this), false);
  }

  onDragOver(event: any) {
    this.preventDefaults(event);
    event.dataTransfer.dropEffect = 'copy'; 
  }

  handleFiles(file: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.parseCerFile(file[0]);
      this.certificatesService.currentCertificates$.pipe(take(1)).subscribe({
        next: c => {
          if (c) this.certificates = c;
        }
      });
    };
    reader.readAsText(file[0]);
  }

  parseCerFile(file: File) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const contents = new Uint8Array(arrayBuffer);
      
      const cert = new X509.X509();
      cert.readCertHex(forge.util.bytesToHex(contents as any));

      const certificate = {
        commonName: this.parseService.parseName(cert.getSubjectString()),
        issuerCn: this.parseService.parseName(cert.getIssuerString()),
        validFrom: this.parseService.parseDate(cert.getNotBefore()),
        validTo: this.parseService.parseDate(cert.getNotAfter())
      };
      
      this.beingParsedCertificate = certificate;

      if (this.certificates && this.beingParsedCertificate){
        this.certificatesService.updateCertificates(this.certificates, this.beingParsedCertificate);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  handleDrop(event: any) {
    this.changeMode();
    this.preventDefaults(event);
    const dt = event.dataTransfer;
    const files = dt.files;
    this.handleFiles(files);
  }

  onFileSelected(event: any) {
    this.changeMode();
    const files: FileList = event.target.files;
    if (files.length > 0) this.handleFiles(files);
  }

  preventDefaults(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }
}