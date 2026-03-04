// src/app/features/patient-profile/dental-chart/treatment-plan-panel/treatment-plan-panel.component.ts
import {
  Component, ElementRef, EventEmitter, Input,
  OnChanges, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tooth } from '../../../../shared/models/patient.model';
import { getToothAsset, ToothAsset } from '../tooth-asset.map';

export interface TreatmentOption { name: string; price?: number; }

export interface TreatmentPlanPayload {
  toothNumber:   number;    // primary tooth (backward compat)
  toothNumbers:  number[];  // ALL selected teeth
  surfaces:      string[];
  examinations:  string[];
  diagnoses:     string[];
  treatment:     string;
}

@Component({
  selector: 'app-treatment-plan-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatment-plan-panel.component.html',
  styleUrls: ['./treatment-plan-panel.component.scss'],
})
export class TreatmentPlanPanelComponent implements OnChanges {
  @Input() tooth: Tooth | null = null;
  /** All selected tooth numbers passed from the chart */
  @Input() selectedTeethNumbers: number[] = [];
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() planAdded = new EventEmitter<TreatmentPlanPayload>();

  @ViewChild('examinationInput') examinationInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('diagnosisInput')   diagnosisInputRef!:   ElementRef<HTMLInputElement>;
  @ViewChild('treatmentInput')   treatmentInputRef!:   ElementRef<HTMLInputElement>;

  /** "27, 28" for multi-select, "23" for single */
  get teethLabel(): string {
    return this.selectedTeethNumbers.length > 1
      ? this.selectedTeethNumbers.join(', ')
      : (this.tooth ? String(this.tooth.number) : '');
  }
  get isMultiTooth(): boolean { return this.selectedTeethNumbers.length > 1; }

  // ── Static data ────────────────────────────────────────────────────────────
  readonly allExaminationOptions = [
    'Pain on palpation positive','TOP Negative','Sensitivity on airblow positive',
    'Sensitivity on airblow Negative','TOP positive','Swelling present',
    'Mobility Grade I','Mobility Grade II','Mobility Grade III',
    'Bleeding on probing','Deep pocket',
  ];
  readonly allDiagnosisOptions = [
    'Gingivitis','Reversible Pulpitis','Irreversible Pulpitis',
    'Periapical Abscess','Periodontitis','Necrotic Pulp','Hello','Dsd',
  ];
  readonly allTreatmentOptions: TreatmentOption[] = [
    { name:'EXTRACTION OF THIRD MOLAR',    price:450  },
    { name:'CROWN LENGTHENING',            price:3500 },
    { name:'INCISION AND DRAINAGE',        price:500  },
    { name:'IMPACTION SURGERY - CANINE',   price:3000 },
    { name:'EXTRACTION OF DIFFICULT TOOTH',price:800  },
    { name:'EXTRACTION - PEDO',            price:200  },
    { name:'ROOT CANAL TREATMENT',         price:3000 },
    { name:'COMPOSITE FILLING',            price:800  },
    { name:'CROWN',                        price:5000 },
    { name:'SCALING & POLISHING',          price:600  },
  ];
  readonly quickTreatments: TreatmentOption[] = [
    { name:'EXTRACTION OF THIRD MOLAR', price:450  },
    { name:'CROWN LENGTHENING',         price:3500 },
    { name:'INCISION AND DRAINAGE',     price:500  },
  ];

  toothAsset!: ToothAsset;
  hoveredSurface: string | null = null;

  get buccalCode()  { return this.isAnterior ? 'F' : 'B'; }
  get buccalLabel() { return this.isAnterior ? 'Facial' : 'Buccal'; }
  get centerCode()  { return this.isAnterior ? 'I' : 'O'; }
  get centerLabel() { return this.isAnterior ? 'Incisal' : 'Occlusal'; }
  get isAnterior()  { return this.isAnteriorTooth(this.tooth?.number ?? 0); }
  isAnteriorTooth(n: number) { return (n>=6&&n<=11)||(n>=22&&n<=27); }

  toggleSurface(code: string): void {
    const i = this.form.surfaces.indexOf(code);
    this.form.surfaces = i === -1
      ? [...this.form.surfaces, code]
      : this.form.surfaces.filter(s => s !== code);
  }
  isSurfaceSelected(c: string) { return this.form.surfaces.includes(c); }

  form = this.emptyForm();

  examinationSearch=''; examinationFocused=false; examinationOpen=false;
  filteredExaminations: string[] = [...this.allExaminationOptions];
  diagnosisSearch='';   diagnosisFocused=false;   diagnosisOpen=false;
  filteredDiagnoses: string[] = [...this.allDiagnosisOptions];
  treatmentSearch='';   treatmentFocused=false;   treatmentOpen=false;
  filteredTreatments: TreatmentOption[] = [...this.allTreatmentOptions];

  ngOnChanges(c: SimpleChanges): void {
    if (c['tooth']?.currentValue)        this.toothAsset = getToothAsset(this.tooth!.number);
    if (c['visible']?.currentValue===true) this.reset();
  }

  focusExaminationInput() { this.examinationInputRef?.nativeElement.focus(); this.examinationOpen=true; this.filterExaminations(); }
  filterExaminations()    { const q=this.examinationSearch.toLowerCase(); this.filteredExaminations=this.allExaminationOptions.filter(o=>o.toLowerCase().includes(q)); }
  selectExamination(opt: string) { if(!this.form.examinations.includes(opt)) this.form.examinations=[...this.form.examinations,opt]; this.examinationSearch=''; this.examinationOpen=false; this.filteredExaminations=[...this.allExaminationOptions]; }
  addCustomExamination()  { const v=this.examinationSearch.trim(); if(v&&!this.form.examinations.includes(v)) this.form.examinations=[...this.form.examinations,v]; this.examinationSearch=''; this.examinationOpen=false; }
  removeExamination(item: string) { this.form.examinations=this.form.examinations.filter(e=>e!==item); }
  onExaminationBlur()     { setTimeout(()=>{this.examinationFocused=false;this.examinationOpen=false;},150); }

  focusDiagnosisInput()   { this.diagnosisInputRef?.nativeElement.focus(); this.diagnosisOpen=true; this.filterDiagnoses(); }
  filterDiagnoses()       { const q=this.diagnosisSearch.toLowerCase(); this.filteredDiagnoses=this.allDiagnosisOptions.filter(o=>o.toLowerCase().includes(q)); }
  selectDiagnosis(opt: string) { this.form.diagnoses=this.form.diagnoses.includes(opt)?this.form.diagnoses.filter(d=>d!==opt):[...this.form.diagnoses,opt]; this.diagnosisSearch=''; this.diagnosisOpen=false; this.filteredDiagnoses=[...this.allDiagnosisOptions]; }
  addCustomDiagnosis()    { const v=this.diagnosisSearch.trim(); if(v&&!this.form.diagnoses.includes(v)) this.form.diagnoses=[...this.form.diagnoses,v]; this.diagnosisSearch=''; this.diagnosisOpen=false; }
  removeDiagnosis(item: string) { this.form.diagnoses=this.form.diagnoses.filter(d=>d!==item); }
  onDiagnosisBlur()       { setTimeout(()=>{this.diagnosisFocused=false;this.diagnosisOpen=false;},150); }
  toggleDiagnosisChip(opt: string) { this.form.diagnoses=this.form.diagnoses.includes(opt)?this.form.diagnoses.filter(d=>d!==opt):[...this.form.diagnoses,opt]; }
  syncSuggestions()       {}

  focusTreatmentInput()   { if(this.form.treatment) return; this.treatmentInputRef?.nativeElement.focus(); this.treatmentOpen=true; this.filterTreatments(); }
  filterTreatments()      { const q=this.treatmentSearch.toLowerCase(); this.filteredTreatments=this.allTreatmentOptions.filter(o=>o.name.toLowerCase().includes(q)); }
  selectTreatment(opt: TreatmentOption) { this.form.treatment=opt.name; this.treatmentSearch=''; this.treatmentOpen=false; this.filteredTreatments=[...this.allTreatmentOptions]; }
  onTreatmentBlur()       { setTimeout(()=>{this.treatmentFocused=false;this.treatmentOpen=false;},150); }

  onAdd(): void {
    if (!this.tooth || !this.form.treatment) return;
    const numbers = this.selectedTeethNumbers.length > 0 ? this.selectedTeethNumbers : [this.tooth.number];
    this.planAdded.emit({
      toothNumber:  numbers[0],
      toothNumbers: numbers,
      surfaces:     [...this.form.surfaces],
      examinations: [...this.form.examinations],
      diagnoses:    [...this.form.diagnoses],
      treatment:    this.form.treatment,
    });
    this.close();
  }

  close()              { this.visible=false; this.visibleChange.emit(false); }
  onBackdropClick()    { this.close(); }

  private reset() {
    this.form=this.emptyForm();
    this.examinationSearch=this.diagnosisSearch=this.treatmentSearch='';
    this.examinationOpen=this.diagnosisOpen=this.treatmentOpen=false;
    this.filteredExaminations=[...this.allExaminationOptions];
    this.filteredDiagnoses=[...this.allDiagnosisOptions];
    this.filteredTreatments=[...this.allTreatmentOptions];
    this.hoveredSurface=null;
  }
  private emptyForm() {
    return { surfaces:[] as string[], examinations:[] as string[], diagnoses:[] as string[], treatment:'' };
  }
}