// src/app/features/patient-profile/clinical-info/clinical-info.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ClinicalInfo } from '../../../shared/models/patient.model';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-clinical-info',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule],
  templateUrl: './clinical-info.component.html',
  styleUrls: ['./clinical-info.component.scss']
})
export class ClinicalInfoComponent implements OnInit {
  @Input({ required: true }) info!: ClinicalInfo;

  // Selected values (bound to p-multiselect)
  selectedChiefComplaints: string[] = [];
  selectedMedicalHistory: string[] = [];
  selectedDentalHistory: string[] = [];
  selectedOnExamination: string[] = [];

  // Available options for each dropdown
  chiefComplaintOptions: SelectOption[] = [
    { label: 'Irregularly placed tooth', value: 'Irregularly placed tooth' },
    { label: 'Broken filling',           value: 'Broken filling'           },
    { label: 'Pain',                     value: 'Pain'                     },
    { label: 'Sensitivity',              value: 'Sensitivity'              },
    { label: 'Bleeding gums',            value: 'Bleeding gums'            },
    { label: 'Swelling',                 value: 'Swelling'                 },
    { label: 'Discolouration of tooth',  value: 'Discolouration of tooth'  },
  ];

  medicalHistoryOptions: SelectOption[] = [
    { label: 'Diabetic',       value: 'Diabetic'       },
    { label: 'Hypertension',   value: 'Hypertension'   },
    { label: 'Heart disease',  value: 'Heart disease'  },
    { label: 'Asthma',         value: 'Asthma'         },
    { label: 'Blood thinner',  value: 'Blood thinner'  },
    { label: 'None',           value: 'None'           },
  ];

  dentalHistoryOptions: SelectOption[] = [
    { label: 'Cold Response',        value: 'Cold Response'        },
    { label: 'Previous RCT',         value: 'Previous RCT'         },
    { label: 'Extraction done',      value: 'Extraction done'      },
    { label: 'Orthodontic treatment',value: 'Orthodontic treatment'},
    { label: 'Implant',              value: 'Implant'              },
    { label: 'None',                 value: 'None'                 },
  ];

  onExaminationOptions: SelectOption[] = [
    { label: 'TOP Negative - 41', value: 'TOP Negative - 41' },
    { label: 'TOP Positive - 41', value: 'TOP Positive - 41' },
    { label: 'TOP Negative - 11', value: 'TOP Negative - 11' },
    { label: 'TOP Positive - 11', value: 'TOP Positive - 11' },
    { label: 'Swelling present',  value: 'Swelling present'  },
    { label: 'Normal',            value: 'Normal'            },
  ];

  ngOnInit(): void {
    // Pre-populate from @Input data
    this.selectedChiefComplaints = [...(this.info.chiefComplaints ?? [])];
    this.selectedMedicalHistory  = [...(this.info.medicalHistory  ?? [])];
    this.selectedDentalHistory   = [...(this.info.dentalHistory   ?? [])];
    this.selectedOnExamination   = [...(this.info.onExamination   ?? [])];
  }
}