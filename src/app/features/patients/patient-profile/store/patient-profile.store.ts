import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Patient, ClinicalInfo, RgvReport, RgvNote, Tooth } from '../../../shared/models/patient.model';
import type {
  DaySession,
  Medicine,
  PrescribedMedicine,
} from '../medications/medications.component';
import type { AdviceSession } from '../advices/advices.component';
import type { LabOrder } from '../lab-orders/lab-orders.component';
import type { ConsultationNote } from '../consultation-notes/consultation-notes.component';
import type { TreatmentCard } from '../treatment-plans-board/treatment-plans-board.component';

export interface PatientProfileState {
  appointmentId: string;
  doctorName: string;
  patient: Patient;
  clinicalInfo: ClinicalInfo;
  reports: RgvReport[];
  notes: RgvNote[];
  teeth: Tooth[];
  showPrescriptionModal: boolean;
  medications: {
    sessions: DaySession[];
    activeSessionIndex: number;
    catalogue: Medicine[];
    selectSearch: string;
    selectOpen: boolean;
    showModal: boolean;
    newMed: { name: string; composition: string; category: string; brandName: string; supplier: string; reorderLevel: number };
  };
  labOrders: {
    list: LabOrder[];
    showDrawer: boolean;
    form: { workName: string; details: string; notes: string; deliveryDate: string };
  };
  advices: {
    sessions: AdviceSession[];
    activeSessionIndex: number;
    newAdvice: string;
  };
  consultation: {
    draftNote: string;
    notes: ConsultationNote[];
  };
  treatmentsBoard: {
    treatments: TreatmentCard[];
    editingPriceId: string | null;
    editingPriceValue: number;
  };
}

type PatientProfileAction =
  | { type: 'SET_APPOINTMENT_ID'; payload: string }
  | { type: 'TOGGLE_PRESCRIPTION_MODAL'; payload: boolean }
  | { type: 'SET_MEDICATIONS_STATE'; payload: Partial<PatientProfileState['medications']> }
  | { type: 'SET_LAB_ORDERS_STATE'; payload: Partial<PatientProfileState['labOrders']> }
  | { type: 'SET_ADVICES_STATE'; payload: Partial<PatientProfileState['advices']> }
  | { type: 'SET_CONSULTATION_STATE'; payload: Partial<PatientProfileState['consultation']> }
  | { type: 'SET_TREATMENTS_BOARD_STATE'; payload: Partial<PatientProfileState['treatmentsBoard']> }
  | { type: 'SET_REPORTS'; payload: RgvReport[] }
  | { type: 'SET_NOTES'; payload: RgvNote[] };

@Injectable({ providedIn: 'root' })
export class PatientProfileStore {
  private readonly subject = new BehaviorSubject<PatientProfileState>(this.createInitialState());
  readonly state$ = this.subject.asObservable();

  get state(): PatientProfileState {
    return this.subject.value;
  }

  dispatch(action: PatientProfileAction): void {
    const next = this.reduce(this.state, action);
    this.subject.next(next);
  }

  setAppointmentId(id: string): void {
    this.dispatch({ type: 'SET_APPOINTMENT_ID', payload: id });
  }

  togglePrescriptionModal(visible: boolean): void {
    this.dispatch({ type: 'TOGGLE_PRESCRIPTION_MODAL', payload: visible });
  }

  setMedicationState(payload: Partial<PatientProfileState['medications']>): void {
    this.dispatch({ type: 'SET_MEDICATIONS_STATE', payload });
  }

  setLabOrdersState(payload: Partial<PatientProfileState['labOrders']>): void {
    this.dispatch({ type: 'SET_LAB_ORDERS_STATE', payload });
  }

  setAdvicesState(payload: Partial<PatientProfileState['advices']>): void {
    this.dispatch({ type: 'SET_ADVICES_STATE', payload });
  }

  setConsultationState(payload: Partial<PatientProfileState['consultation']>): void {
    this.dispatch({ type: 'SET_CONSULTATION_STATE', payload });
  }

  setTreatmentsBoardState(payload: Partial<PatientProfileState['treatmentsBoard']>): void {
    this.dispatch({ type: 'SET_TREATMENTS_BOARD_STATE', payload });
  }

  setReports(payload: RgvReport[]): void {
    this.dispatch({ type: 'SET_REPORTS', payload });
  }

  setNotes(payload: RgvNote[]): void {
    this.dispatch({ type: 'SET_NOTES', payload });
  }

  private reduce(state: PatientProfileState, action: PatientProfileAction): PatientProfileState {
    switch (action.type) {
      case 'SET_APPOINTMENT_ID':
        return { ...state, appointmentId: action.payload };
      case 'TOGGLE_PRESCRIPTION_MODAL':
        return { ...state, showPrescriptionModal: action.payload };
      case 'SET_MEDICATIONS_STATE':
        return { ...state, medications: { ...state.medications, ...action.payload } };
      case 'SET_LAB_ORDERS_STATE':
        return { ...state, labOrders: { ...state.labOrders, ...action.payload } };
      case 'SET_ADVICES_STATE':
        return { ...state, advices: { ...state.advices, ...action.payload } };
      case 'SET_CONSULTATION_STATE':
        return { ...state, consultation: { ...state.consultation, ...action.payload } };
      case 'SET_TREATMENTS_BOARD_STATE':
        return { ...state, treatmentsBoard: { ...state.treatmentsBoard, ...action.payload } };
      case 'SET_REPORTS':
        return { ...state, reports: action.payload };
      case 'SET_NOTES':
        return { ...state, notes: action.payload };
      default:
        return state;
    }
  }

  private createInitialState(): PatientProfileState {
    const patient: Patient = {
      id: '1',
      name: 'Harshad',
      location: 'kerala',
      phone: '+91 9995960143',
      email: '--',
      gender: 'Male',
      age: 35,
      patientId: '4F08D',
      token: 4,
      bookingDate: 'Mon Nov 03 2025',
      alerts: ['Diabetic'],
    };

    const clinicalInfo: ClinicalInfo = {
      chiefComplaints: ['Irregularly placed tooth', 'Broken filling'],
      medicalHistory: ['Diabetic'],
      dentalHistory: ['Cold Response'],
      onExamination: ['TOP Negative - 41'],
    };

    const reports: RgvReport[] = [
      { id: 1, imageUrl: 'x-ray/x-ray1.png', date: '03/11/2025' },
      { id: 2, imageUrl: 'x-ray/x-ray2.png', date: '04/11/2025' },
    ];

    const notes: RgvNote[] = [
      { id: 1, author: 'Arjun', date: 'Nov 4, 2025', content: 'hii' },
      { id: 2, author: 'Arjun', date: 'Nov 3, 2025', content: 'some issues' },
    ];

    const teeth: Tooth[] = [
      ...[18, 17, 16, 15, 14, 13, 12, 11].map((n) => ({ number: n, status: [16, 11, 21, 25].includes(n) ? 'treatment-taken' : 'normal' }) as Tooth),
      ...[21, 22, 23, 24, 25, 26, 27, 28].map((n) => ({ number: n, status: [16, 11, 21, 25].includes(n) ? 'treatment-taken' : 'normal' }) as Tooth),
      ...[48, 47, 46, 45, 44, 43, 42, 41].map((n) => ({ number: n, status: n === 41 ? 'treatment-taken' : 'normal' }) as Tooth),
      ...[31, 32, 33, 34, 35, 36, 37, 38].map((n) => ({ number: n, status: 'normal' }) as Tooth),
    ];

    const catalogue: Medicine[] = [
      {
        id: 'm1',
        name: 'T.MOXIKIND CV 625MG',
        composition: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)',
        category: 'Antibiotic',
        brandName: 'Moxikind',
        supplier: 'MOX CV',
        reorderLevel: 10,
        price: 7,
        batches: ['11111', '22222', '33333'],
      },
      {
        id: 'm2',
        name: 'T.ZERODOL P',
        composition: 'Aceclofenac (100mg) + Paracetamol (325mg)',
        category: 'Analgesic',
        brandName: 'Zerodol',
        supplier: 'Dentobees',
        reorderLevel: 5,
        price: 5,
        batches: ['AAA01', 'AAA02'],
      },
      {
        id: 'm3',
        name: 'xyz',
        composition: 'abcd',
        category: 'Free',
        brandName: '',
        supplier: 'Harshad',
        reorderLevel: 0,
        price: 0,
        batches: ['B0001'],
      },
      {
        id: 'm4',
        name: 'Testing',
        composition: 'Amoxycillin test (500mg) + Clavulanic Acid (125mg)',
        category: 'Starter',
        brandName: 'Test Brand',
        supplier: 'Growth',
        reorderLevel: 2,
        price: 12,
        batches: ['T0001', 'T0002'],
      },
    ];

    const today = new Date();
    const medicationSessions: DaySession[] = [0, 1, 2, 3].map((daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return {
        label: daysAgo === 0 ? 'Today' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        date: d.toISOString(),
        isToday: daysAgo === 0,
        prescriptions:
          daysAgo === 1
            ? [
                {
                  id: 'demo1',
                  medicine: catalogue[0],
                  batch: '11111',
                  dosage: '1 Tab',
                  time: '1-1-1',
                  days: 1,
                  qty: 3,
                  advice: 'After Food',
                },
                {
                  id: 'demo2',
                  medicine: catalogue[0],
                  batch: '11111',
                  dosage: '1 Tab',
                  time: '1-1-1',
                  days: 1,
                  qty: 1,
                  advice: 'After Food',
                },
              ]
            : [],
      };
    });

    const adviceSessions: AdviceSession[] = [0, 1, 2].map((daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return {
        label: daysAgo === 0 ? 'Today' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        date: d.toISOString(),
        isToday: daysAgo === 0,
        advices: daysAgo === 0 ? ['take OPG and visit after one week'] : [],
      };
    });

    const treatments: TreatmentCard[] = [
      {
        id: '1',
        date: 'Nov 11, 2025',
        toothNumber: 23,
        diagnosis: 'Reversible Pulpitis',
        treatmentName: 'EXTRACTION - ADULT',
        qty: 1,
        itemPrice: 400,
        total: 400,
        doctor: 'Arjun',
        status: 'plan',
        surfaces: ['M', 'O'],
      },
      {
        id: '2',
        date: 'Nov 5, 2025',
        toothNumber: 41,
        diagnosis: 'Reversible Pulpitis',
        treatmentName: 'EXTRACTION OF THIRD MOLAR',
        qty: 1,
        itemPrice: 450,
        total: 450,
        doctor: 'Arjun',
        status: 'in-progress',
      },
      {
        id: '3',
        date: 'Nov 5, 2025',
        toothNumber: 21,
        diagnosis: 'Gingivitis',
        treatmentName: 'EXTRACTION OF DIFFICULT TOOTH',
        qty: 1,
        itemPrice: 800,
        total: 800,
        doctor: 'Arjun',
        status: 'completed',
      },
      {
        id: '4',
        date: 'Nov 4, 2025',
        toothNumber: 14,
        diagnosis: 'Periodontitis',
        treatmentName: 'ROOT CANAL TREATMENT',
        qty: 1,
        itemPrice: 3000,
        total: 3000,
        doctor: 'Arjun',
        status: 'completed',
      },
    ];

    return {
      appointmentId: '',
      doctorName: 'Dr. Arjun',
      patient,
      clinicalInfo,
      reports,
      notes,
      teeth,
      showPrescriptionModal: false,
      medications: {
        sessions: medicationSessions,
        activeSessionIndex: 0,
        catalogue,
        selectSearch: '',
        selectOpen: false,
        showModal: false,
        newMed: { name: '', composition: '', category: '', brandName: '', supplier: '', reorderLevel: 0 },
      },
      labOrders: {
        list: [
          {
            id: 'order-1',
            workName: 'CROWN',
            status: 'Order Pending',
            orderDate: '03 Nov 2025',
            deliveryDate: '15 Nov 2025',
            details: 'details',
            notes: '',
          },
        ],
        showDrawer: false,
        form: { workName: 'Full Ceramic Teeth', details: '', notes: '', deliveryDate: '' },
      },
      advices: {
        sessions: adviceSessions,
        activeSessionIndex: 0,
        newAdvice: '',
      },
      consultation: {
        draftNote: '',
        notes: [
          {
            id: 1,
            author: 'Dr. Arjun',
            date: 'Nov 5, 2025',
            content: 'Patient reports sensitivity on upper right quadrant. Advised X-ray follow-up.',
          },
          {
            id: 2,
            author: 'Dr. Arjun',
            date: 'Nov 4, 2025',
            content: 'Initial consultation. Chief complaint: broken filling on tooth 23.',
          },
        ],
      },
      treatmentsBoard: {
        treatments,
        editingPriceId: null,
        editingPriceValue: 0,
      },
    };
  }
}
