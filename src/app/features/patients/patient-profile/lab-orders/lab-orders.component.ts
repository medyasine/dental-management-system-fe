import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientProfileStore } from '../store/patient-profile.store';

export interface LabOrder {
  id: string;
  workName: string;
  status: string;
  orderDate: string;
  deliveryDate: string;
  details: string;
  notes: string;
}

@Component({
  selector: 'app-lab-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-orders.component.html',
  styleUrls: ['./lab-orders.component.scss'],
})
export class LabOrdersComponent {
  private readonly drawerAnimationMs = 300;

  readonly labWorkOptions = ['Full Ceramic Teeth', 'PFM Crown', 'Temporary Crown', 'Metal Crown', 'Zirconia Crown'];

  drawerMounted = false;
  drawerOpen = false;

  constructor(private readonly store: PatientProfileStore) {}

  get labOrders(): LabOrder[] {
    return this.store.state.labOrders.list;
  }

  get form() {
    return this.store.state.labOrders.form;
  }

  openDrawer(): void {
    this.store.setLabOrdersState({
      form: this.emptyForm(),
      showDrawer: true,
    });

    this.drawerMounted = true;
    setTimeout(() => {
      this.drawerOpen = true;
    });
  }

  closeDrawer(): void {
    if (!this.drawerMounted) {
      return;
    }

    this.drawerOpen = false;

    setTimeout(() => {
      this.drawerMounted = false;
      this.store.setLabOrdersState({ showDrawer: false });
    }, this.drawerAnimationMs);
  }

  saveOrder(): void {
    if (!this.form.workName || !this.form.deliveryDate) {
      return;
    }

    this.store.setLabOrdersState({
      list: [
        ...this.labOrders,
        {
          id: Date.now().toString(),
          workName: this.form.workName,
          status: 'Order Pending',
          orderDate: this.formatDate(new Date()),
          deliveryDate: this.formatInputDate(this.form.deliveryDate),
          details: this.form.details.trim(),
          notes: this.form.notes.trim(),
        },
      ],
      form: this.emptyForm(),
    });

    this.closeDrawer();
  }

  removeOrder(order: LabOrder): void {
    this.store.setLabOrdersState({
      list: this.labOrders.filter((item) => item.id !== order.id),
    });
  }

  private emptyForm() {
    return {
      workName: this.labWorkOptions[0],
      details: '',
      notes: '',
      deliveryDate: '',
    };
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatInputDate(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : this.formatDate(parsed);
  }
}
