import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { jsPDF } from 'jspdf';
import { ServiceBookStateModel, ServiceRecord } from '../state/service-book.state';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private fontBase64: string | null = null;
  private fontLoadPromise: Promise<string | null> | null = null;

  constructor(private readonly store: Store) {}

  async exportAllVehicles(): Promise<void> {
    const state = this.store.selectSnapshot<ServiceBookStateModel>((root) => root.serviceBook);
    const vehicles = [...state.vehicles].sort((a, b) => a.nickname.localeCompare(b.nickname));
    const records = state.records;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    await this.applyFont(doc);

    const marginX = 14;
    const lineHeight = 6;
    let cursorY = 18;

    doc.setFontSize(16);
    doc.text($localize`:@@pdfTitle:Szervizkönyv export`, marginX, cursorY);
    cursorY += lineHeight;

    doc.setFontSize(10);
    doc.text(
      `${$localize`:@@pdfGenerated:Készült`}: ${new Date().toLocaleString('hu-HU')}`,
      marginX,
      cursorY
    );
    cursorY += lineHeight * 1.5;

    if (vehicles.length === 0) {
      doc.setFontSize(12);
      doc.text($localize`:@@pdfEmpty:Nincs exportálható jármű.`, marginX, cursorY);
      doc.save('szervizkonyv.pdf');
      return;
    }

    vehicles.forEach((vehicle, index) => {
      cursorY = this.ensureSpace(doc, cursorY, lineHeight * 6);
      doc.setFontSize(13);
      doc.text(`${index + 1}. ${vehicle.nickname}`, marginX, cursorY);
      cursorY += lineHeight;

      doc.setFontSize(10);
      doc.text(
        `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${$localize`:@@pdfVin:Alvázszám`}: ${vehicle.vin}`,
        marginX,
        cursorY
      );
      cursorY += lineHeight;

      const ownerName = this.userLabel(state, vehicle.ownerId);
      const sharedNames = vehicle.sharedWith.map((id) => this.userLabel(state, id)).join(', ');
      doc.text(`${$localize`:@@pdfOwner:Tulajdonos`}: ${ownerName}`, marginX, cursorY);
      cursorY += lineHeight;

      doc.text(
        `${$localize`:@@pdfShared:Megosztva`}: ${sharedNames || $localize`:@@pdfNone:Nincs`}`,
        marginX,
        cursorY
      );
      cursorY += lineHeight;

      const vehicleRecords = records
        .filter((record) => record.vehicleId === vehicle.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (vehicleRecords.length === 0) {
        doc.text($localize`:@@pdfNoRecords:Nincs szervizbejegyzés.`, marginX, cursorY);
        cursorY += lineHeight * 1.5;
        return;
      }

      doc.text($localize`:@@pdfRecords:Szervizbejegyzések:`, marginX, cursorY);
      cursorY += lineHeight;

      vehicleRecords.forEach((record) => {
        cursorY = this.ensureSpace(doc, cursorY, lineHeight * 4);
        this.renderRecord(doc, record, marginX, cursorY, lineHeight);
        cursorY += lineHeight * 3.5;
      });

      cursorY += lineHeight * 0.5;
    });

    doc.save('szervizkonyv.pdf');
  }

  private async applyFont(doc: jsPDF): Promise<void> {
    const fontBase64 = await this.loadFontBase64();
    if (!fontBase64) {
      return;
    }

    doc.addFileToVFS('Arial.ttf', fontBase64);
    doc.addFont('Arial.ttf', 'Arial', 'normal');
    doc.setFont('Arial', 'normal');
  }

  private loadFontBase64(): Promise<string | null> {
    if (this.fontBase64) {
      return Promise.resolve(this.fontBase64);
    }

    if (this.fontLoadPromise) {
      return this.fontLoadPromise;
    }

    this.fontLoadPromise = fetch('/fonts/arial.ttf')
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (!buffer) {
          return null;
        }
        const base64 = this.arrayBufferToBase64(buffer);
        this.fontBase64 = base64;
        return base64;
      })
      .catch(() => null);

    return this.fontLoadPromise;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';

    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
  }

  private renderRecord(
    doc: jsPDF,
    record: ServiceRecord,
    marginX: number,
    cursorY: number,
    lineHeight: number
  ): void {
    doc.setFontSize(11);
    doc.text(`- ${record.title}`, marginX, cursorY);
    doc.setFontSize(10);
    doc.text(
      `${record.date} | ${record.odometer} km | ${record.cost} HUF`,
      marginX + 4,
      cursorY + lineHeight
    );
    if (record.notes) {
      doc.text(record.notes, marginX + 4, cursorY + lineHeight * 2);
    }
  }

  private ensureSpace(doc: jsPDF, cursorY: number, needed: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (cursorY + needed > pageHeight - 12) {
      doc.addPage();
      return 16;
    }
    return cursorY;
  }

  private userLabel(state: ServiceBookStateModel, userId: string): string {
    return (
      state.users.find((user) => user.id === userId)?.name ??
      $localize`:@@pdfUnknown:Ismeretlen felhasználó`
    );
  }
}
