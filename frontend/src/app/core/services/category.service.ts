import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  size: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  active: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private base = `${environment.apiBaseUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; size?: number; search?: string }): Observable<CategoryListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.search) hp = hp.set('search', params.search);
    return this.http.get<CategoryListResponse>(this.base, { params: hp });
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${id}`);
  }

  create(payload: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.base, payload);
  }

  update(id: string, payload: UpdateCategoryRequest): Observable<Category> {
    return this.http.patch<Category>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}