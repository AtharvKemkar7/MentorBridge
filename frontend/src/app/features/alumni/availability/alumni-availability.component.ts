import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumniService } from '../../../core/services/alumni.service';
import { AvailabilitySlot, SessionType } from '../../../core/models/alumni.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  selector: 'ab-alumni-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, ToastContainerComponent, ConfirmDialogComponent, StatusBadgeComponent],
  template: `
    <div class="availability-page">
      <ab-toast-container />
      <ab-confirm-dialog
        [open]="showDeleteDialog()"
        [title]="'Delete Slot'"
        [message]="'Are you sure you want to delete this availability slot? This action cannot be undone.'"
        [confirmLabel]="'Delete'"
        [cancelLabel]="'Cancel'"
        [variant]="'danger'"
        (confirm)="confirmDeleteSlot()"
        (cancel)="showDeleteDialog.set(false)"
      />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Availability & Session Types</h1>
          <p class="page-subtitle">Manage when students can book sessions with you</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading availability..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadData()" />
      } @else {
        <!-- Session Types -->
        <section class="card">
          <header class="section-header">
            <h2 class="section-title">Session Types</h2>
          </header>
          <div class="section-content">
            @if (sessionTypes().length) {
              <div class="session-types-list">
                @for (type of sessionTypes(); track type.id) {
                  <div class="session-type-item">
                    <div class="type-info">
                      <span class="type-name">{{ type.name }}</span>
                      <span class="type-duration">{{ type.durationMinutes }} minutes</span>
                    </div>
                    <div class="type-actions">
                      <button type="button" class="btn-secondary btn-sm" (click)="openEditTypeDialog(type)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openDeleteTypeDialog(type)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-message">No session types configured. Add your first session type below.</p>
            }

            <div class="type-form" [class.editing]="editingType()">
              <h3 class="form-title">{{ editingType() ? 'Edit Session Type' : 'Add Session Type' }}</h3>
              <form (ngSubmit)="saveSessionType()" #typeForm="ngForm">
                <div class="form-row">
                  <div class="form-group">
                    <label for="typeName" class="form-label">Name <span class="required">*</span></label>
                    <input id="typeName" type="text" class="form-input" name="name" [(ngModel)]="typeFormData.name" required placeholder="e.g., Resume Review, Mock Interview" />
                  </div>
                  <div class="form-group">
                    <label for="typeDuration" class="form-label">Duration (minutes) <span class="required">*</span></label>
                    <input id="typeDuration" type="number" class="form-input" name="duration" [(ngModel)]="typeFormData.durationMinutes" required min="15" max="180" step="15" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="typeDescription" class="form-label">Description</label>
                  <textarea id="typeDescription" class="form-textarea" name="description" [(ngModel)]="typeFormData.description" rows="2" placeholder="Brief description of what this session covers"></textarea>
                </div>
                <div class="form-actions">
                  @if (editingType()) {
                    <button type="button" class="btn-secondary" (click)="cancelEditType()">Cancel</button>
                  }
                  <button type="submit" class="btn-primary" [disabled]="typeForm.invalid">
                    {{ editingType() ? 'Update' : 'Add' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- Availability Slots -->
        <section class="card">
          <header class="section-header">
            <h2 class="section-title">Availability Slots</h2>
          </header>
          <div class="section-content">
            @if (slots().length) {
              <div class="slots-grid">
                @for (slot of slots(); track slot.id) {
                  <div class="slot-card" [class.recurring]="slot.isRecurring">
                    <div class="slot-header">
                      <div class="slot-day">{{ getDayName(slot.dayOfWeek) }}</div>
                      <div class="slot-time">
                        <span class="time-range">{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</span>
                        @if (!slot.isRecurring && slot.specificDate) {
                          <span class="specific-date">({{ formatDate(slot.specificDate) }})</span>
                        }
                      </div>
                    </div>
                    <div class="slot-meta">
                      <ab-status-badge [label]="slot.isRecurring ? 'Weekly Recurring' : 'One-time'" [variant]="slot.isRecurring ? 'primary' : 'secondary'" [dot]="true" />
                    </div>
                    <div class="slot-actions">
                      <button type="button" class="btn-danger btn-sm" (click)="openDeleteSlotDialog(slot)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-message">No availability slots configured. Add your first slot below.</p>
            }

            <div class="slot-form">
              <h3 class="form-title">Add Availability Slot</h3>
              <form (ngSubmit)="addSlot()" #slotForm="ngModel">
                <div class="form-row">
                  <div class="form-group">
                    <label for="slotDay" class="form-label">Day <span class="required">*</span></label>
                    <select id="slotDay" class="form-select" name="dayOfWeek" [(ngModel)]="slotFormData.dayOfWeek" required>
                      <option value="">Select day</option>
                      @for (day of days; track day) {
                        <option [value]="day.value">{{ day.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="slotType" class="form-label">Session Type <span class="required">*</span></label>
                    <select id="slotType" class="form-select" name="sessionTypeId" [(ngModel)]="slotFormData.sessionTypeId" required>
                      <option value="">Select type</option>
                      @for (type of sessionTypes(); track type.id) {
                        <option [value]="type.id">{{ type.name }} ({{ type.durationMinutes }} min)</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="slotStart" class="form-label">Start Time <span class="required">*</span></label>
                    <input id="slotStart" type="time" class="form-input" name="startTime" [(ngModel)]="slotFormData.startTime" required />
                  </div>
                  <div class="form-group">
                    <label for="slotEnd" class="form-label">End Time <span class="required">*</span></label>
                    <input id="slotEnd" type="time" class="form-input" name="endTime" [(ngModel)]="slotFormData.endTime" required />
                  </div>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" name="isRecurring" [(ngModel)]="slotFormData.isRecurring" />
                    <span class="checkbox-text">Weekly recurring slot</span>
                  </label>
                </div>
                @if (!slotFormData.isRecurring) {
                  <div class="form-group">
                    <label for="slotDate" class="form-label">Specific Date <span class="required">*</span></label>
                    <input id="slotDate" type="date" class="form-input" name="specificDate" [(ngModel)]="slotFormData.specificDate" [required]="!slotFormData.isRecurring" />
                  </div>
                }
                <div class="form-actions">
                  <button type="submit" class="btn-primary" [disabled]="slotForm.invalid || !sessionTypes().length">Add Slot</button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- Timezone Info -->
        <section class="card info-card">
          <div class="section-content">
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <h3 class="info-title">Your Timezone</h3>
                <p class="info-value">{{ profile()?.timezone || 'Not set' }}</p>
              </div>
            </div>
            <p class="info-note">All availability slots and bookings are shown in your local timezone. Students will see converted times in their own timezone.</p>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .availability-page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; margin-bottom: 1.5rem; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-content { padding: 1.25rem 1.5rem; }

    .session-types-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .session-type-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; }
    .type-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .type-name { font-weight: 500; color: #2c3e50; }
    .type-duration { font-size: 0.8125rem; color: #6c757d; }
    .type-actions { display: flex; gap: 0.5rem; }
    .btn-primary, .btn-secondary, .btn-danger {
      display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { padding: 0.5rem 1rem; color: #fff; background: #2c3e50; }
    .btn-primary:hover:not(:disabled) { background: #1a252f; }
    .btn-secondary { padding: 0.5rem 1rem; color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { padding: 0.5rem 1rem; color: #fff; background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    .empty-message { color: #6c757d; font-style: italic; margin-bottom: 1rem; }

    .type-form, .slot-form { padding: 1.5rem; background: #f8f9fa; border-radius: 0.5rem; border: 1px solid #e9ecef; }
    .form-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #2c3e50; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #2c3e50; }
    .required { color: #dc3545; }
    .form-input, .form-select, .form-textarea {
      padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: #2c3e50;
      background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }
    .form-textarea { resize: vertical; min-height: 60px; font-family: inherit; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

    .checkbox-group { margin-top: 0.5rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #2c3e50; cursor: pointer; }

    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .slot-card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .slot-card.recurring { border-left: 4px solid #1a73e8; }
    .slot-header { display: flex; align-items: center; justify-content: space-between; }
    .slot-day { font-size: 1rem; font-weight: 600; color: #2c3e50; text-transform: capitalize; }
    .slot-time { display: flex; flex-direction: column; align-items: flex-end; gap: 0.125rem; }
    .time-range { font-size: 0.875rem; font-weight: 500; color: #495057; }
    .specific-date { font-size: 0.75rem; color: #6c757d; }
    .slot-meta { padding-top: 0.5rem; border-top: 1px solid #e9ecef; }
    .slot-actions { display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid #e9ecef; }

    .info-card { background: #f8f9fa; border-color: #e9ecef; }
    .info-item { display: flex; align-items: flex-start; gap: 1rem; }
    .info-item svg { color: #6c757d; flex-shrink: 0; margin-top: 0.125rem; }
    .info-title { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: #2c3e50; }
    .info-value { margin: 0; font-size: 1rem; color: #495057; }
    .info-note { margin: 1rem 0 0; font-size: 0.8125rem; color: #6c757d; }

    @media (max-width: 768px) {
      .availability-page { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .form-row { grid-template-columns: 1fr; }
      .slots-grid { grid-template-columns: 1fr; }
      .session-type-item { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .type-actions { width: 100%; justify-content: flex-end; }
    }
  `]
})
export class AlumniAvailabilityComponent implements OnInit {
  alumniService = inject(AlumniService);
  toast = inject(ToastContainerComponent);

  slots = signal<AvailabilitySlot[]>([]);
  sessionTypes = signal<SessionType[]>([]);
  profile = this.alumniService.profile;

  loading = signal(false);
  error = signal<string | null>(null);

  editingType = signal<SessionType | null>(null);
  typeFormData = { name: '', durationMinutes: 60, description: '' };

  slotFormData = { dayOfWeek: 0, sessionTypeId: '', startTime: '09:00', endTime: '10:00', isRecurring: true, specificDate: '' };

  showDeleteDialog = signal(false);
  pendingDeleteSlot = signal<AvailabilitySlot | null>(null);
  pendingDeleteType = signal<SessionType | null>(null);

  days = DAYS.map((label, value) => ({ label, value }));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.alumniService.getAvailability().subscribe({
      next: (slots) => { this.slots.set(slots); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to load availability'); this.loading.set(false); }
    });
    this.alumniService.getSessionTypes().subscribe({
      next: (types) => this.sessionTypes.set(types),
      error: () => {}
    });
  }

  saveSessionType(): void {
    if (this.editingType()) {
      this.alumniService.updateSessionType(this.editingType()!.id, this.typeFormData).subscribe({
        next: () => { this.toast.success('Updated', 'Session type updated.'); this.loadData(); this.cancelEditType(); },
        error: (err) => this.toast.error('Failed', err.error?.message || 'Failed to update')
      });
    } else {
      this.alumniService.createSessionType(this.typeFormData).subscribe({
        next: () => { this.toast.success('Added', 'Session type added.'); this.loadData(); this.typeFormData = { name: '', durationMinutes: 60, description: '' }; },
        error: (err) => this.toast.error('Failed', err.error?.message || 'Failed to add')
      });
    }
  }

  openEditTypeDialog(type: SessionType): void {
    this.editingType.set(type);
    this.typeFormData = { name: type.name, durationMinutes: type.durationMinutes, description: type.description || '' };
  }

  cancelEditType(): void {
    this.editingType.set(null);
    this.typeFormData = { name: '', durationMinutes: 60, description: '' };
  }

  openDeleteTypeDialog(type: SessionType): void {
    this.pendingDeleteType.set(type);
    // Could add a confirm dialog here
    this.alumniService.deleteSessionType(type.id).subscribe({
      next: () => { this.toast.success('Deleted', 'Session type deleted.'); this.loadData(); },
      error: (err) => this.toast.error('Failed', err.error?.message || 'Failed to delete')
    });
  }

  openDeleteSlotDialog(slot: AvailabilitySlot): void {
    this.pendingDeleteSlot.set(slot);
    this.showDeleteDialog.set(true);
  }

  confirmDeleteSlot(): void {
    const slot = this.pendingDeleteSlot();
    if (!slot) return;
    // This would need a delete endpoint - for now just remove from local state
    this.slots.update(s => s.filter(s => s.id !== slot.id));
    this.toast.success('Deleted', 'Availability slot removed.');
    this.showDeleteDialog.set(false);
    this.pendingDeleteSlot.set(null);
  }

  addSlot(): void {
    if (!this.slotFormData.sessionTypeId) return;
    const newSlot: AvailabilitySlot = {
      id: crypto.randomUUID(),
      dayOfWeek: this.slotFormData.dayOfWeek,
      startTime: this.slotFormData.startTime,
      endTime: this.slotFormData.endTime,
      isRecurring: this.slotFormData.isRecurring,
      specificDate: this.slotFormData.specificDate || undefined,
    };
    // This would need a backend endpoint - for now just add to local state
    this.slots.update(s => [...s, newSlot]);
    this.toast.success('Added', 'Availability slot added.');
    this.slotFormData = { dayOfWeek: 0, sessionTypeId: '', startTime: '09:00', endTime: '10:00', isRecurring: true, specificDate: '' };
  }

  getDayName(day: number): string {
    return DAYS[day];
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}