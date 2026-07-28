import jsPDF from 'jspdf';
import { FerryDossier, PilotProfile, ContractCompany } from '../types';
import { getAviationAuthority } from './aviationAuthority';

export const generateFerryAuthorizationPdf = (
  dossier: FerryDossier,
  company: ContractCompany,
  pilot: PilotProfile
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const originAuth = getAviationAuthority(dossier.originCountryCode, dossier.originCountryName);
  const destAuth = getAviationAuthority(dossier.destinationCountryCode, dossier.destinationCountryName);

  // Background tint header
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(0, 0, 210, 297, 'F');

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Top header text
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DSI FLIGHT OPS • GLOBAL FERRY & DISPATCH DIVISION', 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('CARTA DE AUTORIZAÇÃO DE TRANSLADO DE AERONAVE', 14, 20);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DOCUMENTO OFICIAL DE DESPACHO INTERNACIONAL E PROCURAÇÃO TÉCNICA', 14, 26);

  // License badge right side
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(145, 10, 51, 14, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('LICENÇA DE EXPORTAÇÃO Nº', 148, 15);
  doc.setFontSize(9);
  doc.text(dossier.exportLicenseNo || 'EXP-2026-GLOBAL', 148, 20);

  let y = 42;

  // Legal intro box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(251, 191, 36); // amber-400
  doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

  doc.setTextColor(120, 53, 15); // amber-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TERMO OFICIAL DE AUTORIZAÇÃO E PROCURAÇÃO DE TRANSLADO', 18, y + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  const introText = `A contratante ${dossier.currentOwner} concede plenos poderes de translado ao Comandante ${pilot.name} para conduzir a aeronave ${dossier.aircraftModel} de ${dossier.originCountryName} para ${dossier.destinationCountryName}, cumprindo as normas da ${originAuth.civilAuthority} e ${destAuth.civilAuthority}.`;
  const splitIntro = doc.splitTextToSize(introText, 174);
  doc.text(splitIntro, 18, y + 12);

  y += 28;

  // Section helper
  const drawSectionHeader = (title: string, startY: number) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(14, startY, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(title, 18, startY + 5);
  };

  // Section 1: PILOT DATA
  drawSectionHeader('1. DADOS DO PILOTO COMANDANTE (SOLICITANTE)', y);
  y += 9;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 28, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');

  doc.text('NOME DO COMANDANTE:', 18, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(pilot.name, 62, y + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('CALLSIGN / CÓDIGO DE VOO:', 18, y + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(pilot.preferredCallsign || 'PT-PLT', 68, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('NÍVEL DE HABILITAÇÃO:', 18, y + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(pilot.title, 58, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('HORAS DE VOO REGISTRADAS:', 18, y + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${pilot.totalFlightHours} Horas`, 68, y + 24);

  y += 33;

  // Section 2: PROPRIETÁRIO / CONTRATANTE
  drawSectionHeader('2. DADOS DO PROPRIETÁRIO & CONTRATANTE', y);
  y += 9;

  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 32, 'FD');

  doc.setFontSize(8);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('RAZÃO SOCIAL / PROPRIETÁRIO:', 18, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.currentOwner, 72, y + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRO FISCAL / TAX ID (CNPJ/EIN):', 18, y + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.ownerTaxId || 'N/A', 80, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ENDEREÇO DA EMPRESA:', 18, y + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.ownerAddress || 'N/A', 58, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('APÓLICE DE SEGURO INTERNACIONAL:', 18, y + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.insurancePolicyNo || 'N/A', 80, y + 24);

  y += 37;

  // Section 3: AERONAVE
  drawSectionHeader('3. DADOS TÉCNICOS DA AERONAVE', y);
  y += 9;

  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 32, 'FD');

  doc.setFontSize(8);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('MODELO DA AERONAVE:', 18, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.aircraftModel, 58, y + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('NÚMERO DE SÉRIE (MSN):', 18, y + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.msn, 60, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('MATRÍCULA DE ORIGEM:', 18, y + 18);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.originalRegistration, 58, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('NOVA MATRÍCULA (RESERVA DE MARCAS):', 110, y + 18);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.newRegistration, 175, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PESO MÁXIMO DE DECOLAGEM (MTOW):', 18, y + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dossier.mtowKg.toLocaleString('pt-BR')} kg`, 80, y + 24);

  y += 37;

  // Section 4: ROTA & AUTORIDADES
  drawSectionHeader('4. ROTA DE TRANSLADO & ÓRGÃOS DE REGULAÇÃO', y);
  y += 9;

  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 28, 'FD');

  doc.setFontSize(8);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PAÍS & AUTORIDADE DE ORIGEM:', 18, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dossier.originCountryName} (${originAuth.civilAuthority})`, 72, y + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PAÍS & AUTORIDADE DE DESTINO:', 18, y + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dossier.destinationCountryName} (${destAuth.civilAuthority})`, 72, y + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PORT OF ENTRY (AEROPORTO DE ENTRADA):', 18, y + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dossier.portOfEntryName} (${dossier.portOfEntryIcao})`, 82, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('CIDADE / UF DE DESEMBARQUE:', 18, y + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(dossier.portOfEntryCity, 68, y + 24);

  y += 33;

  // Bottom Stamp Box
  doc.setDrawColor(180, 83, 9);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STAMP / SELO DE AUTENTICIDADE DIGITAL:', 18, y + 6);

  doc.setFont('helvetica', 'mono');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`HASH SHA256: FERRY-${dossier.exportLicenseNo || 'EXP-2026'}-${pilot.name.replace(/\s+/g, '').toUpperCase()}-AUTH-OK`, 18, y + 12);

  // Footer text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Este PDF é o documento de referência oficial da empresa para preenchimento dos formulários de exportação e nacionalização durante a viagem.', 14, 288);

  // Save PDF
  doc.save(`DOC_AUTORIZACAO_TRANSLADO_${dossier.originalRegistration}.pdf`);
};
