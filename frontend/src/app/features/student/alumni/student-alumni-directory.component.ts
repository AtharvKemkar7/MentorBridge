import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
import { AlumniSummary } from '../../../core/models/student.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { AlumniCardComponent, AlumniCardData } from '../../../shared/components/alumni-card/alumni-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'ab-student-alumni-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent, AlumniCardComponent, StatusBadgeComponent],
  template: `
    <div class="alumni-directory">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Discover Alumni</h1>
          <p class="page-subtitle">Find verified alumni mentors for career guidance and mentorship</p>
        </div>
      </header>

      <!-- Search & Filters -->
      <section class="filters-section card">
        <div class="filters-header">
          <h2 class="filters-title">Filters</h2>
          <button type="button" class="btn-clear" (click)="clearFilters()" [disabled]="!hasActiveFilters()">Clear All</button>
        </div>
        
        <div class="filters-grid">
          <div class="filter-group">
            <label for="search" class="filter-label">Search</label>
            <div class="filter-input-wrapper">
              <svg class="filter-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input id="search" type="text" class="filter-input" placeholder="Search by name, role, company..." [(ngModel)]="filters.query" (ngModelChange)="onFilterChange()" />
            </div>
          </div>

          <div class="filter-group">
            <label for="skills" class="filter-label">Skills</label>
            <input id="skills" type="text" class="filter-input" placeholder="e.g., Python, React, AWS" [(ngModel)]="filters.skillsInput" (ngModelChange)="onSkillsChange()" />
            <div class="filter-chips">
              @for (skill of selectedSkills(); track skill) {
                <span class="filter-chip">{{ skill }} <button type="button" class="chip-remove" (click)="removeSkill(skill)" aria-label="Remove {{ skill }}">×</button></span>
              }
            </div>
          </div>

          <div class="filter-group">
            <label for="expertise" class="filter-label">Expertise</label>
            <input id="expertise" type="text" class="filter-input" placeholder="e.g., Machine Learning, DevOps" [(ngModel)]="filters.expertiseInput" (ngModelChange)="onExpertiseChange()" />
            <div class="filter-chips">
              @for (exp of selectedExpertise(); track exp) {
                <span class="filter-chip">{{ exp }} <button type="button" class="chip-remove" (click)="removeExpertise(exp)" aria-label="Remove {{ exp }}">×</button></span>
              }
            </div>
          </div>

          <div class="filter-group">
            <label for="careerInterests" class="filter-label">Career Interests</label>
            <input id="careerInterests" type="text" class="filter-input" placeholder="e.g., Product Management, Data Science" [(ngModel)]="filters.careerInterestsInput" (ngModelChange)="onCareerInterestsChange()" />
            <div class="filter-chips">
              @for (interest of selectedCareerInterests(); track interest) {
                <span class="filter-chip">{{ interest }} <button type="button" class="chip-remove" (click)="removeCareerInterest(interest)" aria-label="Remove {{ interest }}">×</button></span>
              }
            </div>
          </div>

          <div class="filter-group">
            <label for="industry" class="filter-label">Industry</label>
            <select id="industry" class="filter-select" [(ngModel)]="filters.industry" (ngModelChange)="onFilterChange()">
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Consulting">Consulting</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="company" class="filter-label">Company</label>
            <input id="company" type="text" class="filter-input" placeholder="Search by company" [(ngModel)]="filters.company" (ngModelChange)="onFilterChange()" />
          </div>

          <div class="filter-group">
            <label for="availability" class="filter-label">Availability</label>
            <select id="availability" class="filter-select" [(ngModel)]="filters.availabilityStatus" (ngModelChange)="onFilterChange()">
              <option value="">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="verification" class="filter-label">Verification</label>
            <select id="verification" class="filter-select" [(ngModel)]="filters.verificationStatus" (ngModelChange)="onFilterChange()">
              <option value="">All</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="PENDING">Pending</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sortBy" class="filter-label">Sort By</label>
            <select id="sortBy" class="filter-select" [(ngModel)]="filters.sortBy" (ngModelChange)="onFilterChange()">
              <option value="relevance">Relevance</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="experience">Experience (High to Low)</option>
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Results -->
      <section class="results-section">
        <div class="results-header">
          <div class="results-info">
            @if (loading()) {
              <ab-loading-spinner [size]="20" [inline]="true" message="Loading..." />
            } @else {
              <span class="results-count">{{ totalElements() }} alumni found</span>
            }
          </div>
          <div class="results-view">
            <button type="button" class="view-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" aria-label="Grid view">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button type="button" class="view-btn" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" aria-label="List view">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
          </div>
        </div>

        @if (error()) {
          <ab-error-state [message]="error()" (retry)="loadAlumni()" />
        } @else if (loading() && alumni().length === 0) {
          <div class="loading-placeholder">
            <ab-loading-spinner [overlay]="false" message="Loading alumni..." />
          </div>
        } @else if (alumni().length === 0) {
          <ab-empty-state
            title="No Alumni Found"
            message="Try adjusting your filters or search terms to find more alumni."
            actionLabel="Clear Filters"
            actionClick="clearFilters"
            [centered]="true"
          />
        } @else {
          <div class="alumni-grid" [class.list-view]="viewMode() === 'list'">
            @for (alumni of alumni(); track alumni.id) {
              <ab-alumni-card [alumni]="toCardData(alumni)" [compact]="viewMode() === 'list'" [showRequestButton]="true" (requestMentorship)="onRequestMentorship($event)" />
            }
          </div>

          <ab-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" [totalElements]="totalElements()" (pageChange)="onPageChange($event)" />
        }
      </section>
    </div>
  `,
  styles: [`
    .alumni-directory { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }

    .filters-section { margin-bottom: 1.5rem; }
    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; padding: 1.5rem; }
    .filters-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .filters-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .btn-clear { padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: #6c757d; background: transparent; border: 1px solid #dee2e6; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; }
    .btn-clear:hover:not(:disabled) { color: #dc3545; border-color: #dc3545; }
    .btn-clear:disabled { opacity: 0.5; cursor: not-allowed; }

    .filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .filter-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6c757d; }
    .filter-input-wrapper { position: relative; }
    .filter-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #adb5bd; pointer-events: none; }
    .filter-input, .filter-select {
      width: 100%; padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: #2c3e50;
      background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .filter-input { padding-left: 2.5rem; }
    .filter-input:focus, .filter-select:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.25rem; }
    .filter-chip { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; font-size: 0.75rem; font-weight: 500; background: #e7f3ff; color: #1a73e8; border-radius: 9999px; }
    .chip-remove { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: none; background: transparent; color: inherit; border-radius: 50%; cursor: pointer; font-size: 1rem; line-height: 1; }
    .chip-remove:hover { background: rgba(0,0,0,0.1); }

    .results-section { }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
    .results-count { font-size: 0.875rem; color: #6c757d; }
    .results-view { display: flex; gap: 0.25rem; }
    .view-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #dee2e6; background: #fff; border-radius: 0.375rem; color: #6c757d; cursor: pointer; transition: all 0.2s ease; }
    .view-btn:hover { background: #f8f9fa; border-color: #ced4da; }
    .view-btn.active { background: #2c3e50; border-color: #2c3e50; color: #fff; }

    .alumni-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
    .alumni-grid.list-view { grid-template-columns: 1fr; }
    .alumni-grid.list-view ab-alumni-card { width: 100%; }

    .loading-placeholder { display: flex; justify-content: center; padding: 3rem; }

    @media (max-width: 768px) {
      .alumni-directory { padding: 1rem; }
      .filters-grid { grid-template-columns: 1fr; }
      .alumni-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StudentAlumniDirectoryComponent implements OnInit {
  studentService = inject(StudentService);

  filters = signal({
    query: '',
    skills: [] as string[],
    skillsInput: '',
    expertise: [] as string[],
    expertiseInput: '',
    careerInterests: [] as string[],
    careerInterestsInput: '',
    industry: '',
    company: '',
    availabilityStatus: '',
    verificationStatus: '',
    sortBy: 'relevance',
    page: 1,
    size: 12,
  });

  selectedSkills = computed(() => this.filters().skills);
  selectedExpertise = computed(() => this.filters().expertise);
  selectedCareerInterests = computed(() => this.filters().careerInterests);

  alumni = signal<AlumniSummary[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.query || f.skills.length || f.expertise.length || f.careerInterests.length || f.industry || f.company || f.availabilityStatus || f.verificationStatus);
  });

  ngOnInit(): void {
    this.loadAlumni();
  }

  loadAlumni(): void {
    this.loading.set(true);
    this.error.set(null);
    const f = this.filters();
    this.studentService.searchAlumni({
      query: f.query || undefined,
      skills: f.skills.length ? f.skills : undefined,
      expertise: f.expertise.length ? f.expertise : undefined,
      careerInterests: f.careerInterests.length ? f.careerInterests : undefined,
      industry: f.industry || undefined,
      company: f.company || undefined,
      availabilityStatus: f.availabilityStatus || undefined,
      verificationStatus: f.verificationStatus || undefined,
      page: f.page - 1,
      size: f.size,
      sortBy: f.sortBy,
    }).subscribe({
      next: (res) => {
        this.alumni.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number + 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load alumni');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.filters.update(f => ({ ...f, page: 1 }));
    this.loadAlumni();
  }

  onSkillsChange(): void {
    const input = this.filters().skillsInput.trim();
    if (input) {
      this.filters.update(f => ({ ...f, skills: [...new Set([...f.skills, input])], skillsInput: '' }));
      this.loadAlumni();
    }
  }

  onExpertiseChange(): void {
    const input = this.filters().expertiseInput.trim();
    if (input) {
      this.filters.update(f => ({ ...f, expertise: [...new Set([...f.expertise, input])], expertiseInput: '' }));
      this.loadAlumni();
    }
  }

  onCareerInterestsChange(): void {
    const input = this.filters().careerInterestsInput.trim();
    if (input) {
      this.filters.update(f => ({ ...f, careerInterests: [...new Set([...f.careerInterests, input])], careerInterestsInput: '' }));
      this.loadAlumni();
    }
  }

  removeSkill(skill: string): void {
    this.filters.update(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
    this.loadAlumni();
  }

  removeExpertise(exp: string): void {
    this.filters.update(f => ({ ...f, expertise: f.expertise.filter(e => e !== exp) }));
    this.loadAlumni();
  }

  removeCareerInterest(interest: string): void {
    this.filters.update(f => ({ ...f, careerInterests: f.careerInterests.filter(i => i !== interest) }));
    this.loadAlumni();
  }

  clearFilters(): void {
    this.filters.set({
      query: '',
      skills: [],
      skillsInput: '',
      expertise: [],
      expertiseInput: '',
      careerInterests: [],
      careerInterestsInput: '',
      industry: '',
      company: '',
      availabilityStatus: '',
      verificationStatus: '',
      sortBy: 'relevance',
      page: 1,
      size: 12,
    });
    this.loadAlumni();
  }

  onPageChange(page: number): void {
    this.filters.update(f => ({ ...f, page }));
    this.loadAlumni();
  }

  toCardData(alumni: AlumniSummary): AlumniCardData {
    return {
      id: alumni.id,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      avatarUrl: alumni.avatarUrl,
      currentRole: alumni.currentRole,
      company: alumni.company,
      experienceYears: alumni.experienceYears,
      skills: alumni.skills,
      expertise: alumni.expertise,
      mentorshipAreas: alumni.mentorshipAreas,
      availabilityStatus: alumni.availabilityStatus,
      verificationStatus: alumni.verificationStatus,
      averageRating: alumni.averageRating,
      totalReviews: alumni.totalReviews,
    };
  }

  onRequestMentorship(alumniId: string): void {
    // Navigate to mentorship request page with pre-selected mentor
  }
}