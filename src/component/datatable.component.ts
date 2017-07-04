import { Component, OnInit, Input, ViewEncapsulation, ContentChild, TemplateRef, Inject } from '@angular/core';
import { URLSearchParams, Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'ng-datatable-x',
    template: `
    <ng-template [ngIf]="config.navbarVisible">
    <nav class="navbar navbar-table-top" *ngIf="selectedCount>0">
        <div class="d-flex justify-content-between">
            <span class="navbar-text">{{selectedCount}} Selected / {{count}} total</span>
            <form class="form-inline">
                <div class="btn-group" role="group">
                    <ng-template [ngTemplateOutlet]="selectedBtnsGroups"></ng-template>
                </div>
            </form>
        </div>
    </nav>
    <nav class="navbar navbar-table-top" *ngIf="!selectedCount">
        <div class="d-flex justify-content-between" *ngIf="!enableSearch">
            <span class="navbar-text">{{config.title}}</span>
            <form class="form-inline">
                <div class="btn-group-1" role="group">
                    <button *ngIf="config.search" type="button" class="btn btn-icon-only btn-icon-lg" placement="top" ngbTooltip="Search" container="body"
                        (click)="enableSearch=!enableSearch;">
                        <i class="mdi mdi-magnify"></i>
                    </button>
                    <button type="button" class="btn btn-icon-only btn-icon-lg" placement="top"
                            ngbTooltip="Refresh" container="body" (click)="refresh();">
                        <i class="mdi mdi-refresh"></i>
                    </button>
                    <ng-template [ngTemplateOutlet]="btnGroups"></ng-template>

                </div>
            </form>
        </div>
        <div class="d-flex justify-content-between" *ngIf="enableSearch">
            <div class="form-inline w-100">
                <div class="input-group w-100">
                    <span class="input-group-addon"><i class="mdi mdi-magnify"></i></span>
                    <div class="input-group-btn" *ngIf="searchBy">
                        <md-select name="filterColumn" placeholder="Filter By" floatPlaceholder="never" [(ngModel)]="searchBy">
                            <md-option *ngFor="let item of searchItems" [value]="item.searchKey">
                                {{ item.name }}
                        </md-option>
                    </md-select>
                </div>
                <input type="text" class="form-control" placeholder="Search" autofocus [(ngModel)]="searchValue" (keyup)='onSearch($event)'>
                       <span (click)="clearSearch();" class="input-group-addon cursor-pointer"><i class="mdi mdi-close"></i></span>
            </div>
        </div>
    </div>
</nav>
</ng-template>
<div class='tab-content-dt' [ngClass]="{'loading-dt':!dataLoaded}">
    <div class="datatable table-responsive">
        <table class="table">
            <thead *ngIf="config.headerVisible">
                <tr>
                <ng-template ngFor  let-column [ngForOf]="columns">
                         <th class="{{column.class}}"
                [ngClass]="{'cursor-pointer':column.sortable}"
                (click)="changeSorting(column.name,column.sortable)"
                nowrap="nowrap">
                <ng-template [ngIf]="column.name">{{column.name}}</ng-template>
                <span *ngIf="column.sortable && sortClass(column.name)">
                    <i [class]="sortClass(column.name)"></i>
                </span>
                <label class="custom-control custom-checkbox" *ngIf="column.selectable">
                    <input type="checkbox" class="custom-control-input" [checked]="selectAll" (change)="onSelectAll(selectAll)" [(ngModel)]="selectAll" >
                    <span class="custom-control-indicator"></span>
                </label>
                <button type="button" *ngIf="column.expandable"
                        class="btn btn-icon-only expand-row-icon"
                        title="Expand/Collapse All"
                        (click)="toggleExpandAll()">
                    <i class="mdi" [ngClass]='{"mdi-arrow-expand-all":!expandAll, "mdi-arrow-compress-all":expandAll}'></i>
                </button>
                </th>
            </ng-template>
            </tr>
            </thead>
            <tbody>

            <ng-template ngFor let-n="index" let-row [ngForOf]="rows">
                <tr>
                    <td [attr.class]="columns[0].class">
                        <label class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" [checked]="row.selected" (change)="onCheckboxChange(row)" >
                            <span class="custom-control-indicator"></span>
                        </label>
                    </td>
                    <td [attr.class]="columns[1].class">
                        <button type="button"
                                class="btn btn-icon-only expand-row-icon"
                                title="Expand/Collapse Row"
                                (click)="row.expanded = !row.expanded">
                            <i class="mdi" [ngClass]='{"mdi-chevron-right":!row.expanded, "mdi-chevron-down":row.expanded}'></i>
                        </button>
                    </td>
                    <td [attr.class]="columns[2].class">
                        {{(n +1) + rowsIndex}}
                    </td>

                <ng-template [ngTemplateOutlet]="rowGroups" [ngOutletContext]="{ $implicit: row }"></ng-template>
                </tr>
                <tr class="expand-row" *ngIf="row.expanded">
                    <td colspan="10">
                        <div class="card-block bg-faded">
                            <div class='details'>
                                <ng-template [ngTemplateOutlet]="rowDetails" [ngOutletContext]="{ $implicit: row }"></ng-template>
                            </div>
                        </div>
                    </td>
                </tr>
            </ng-template>
            <tr class="no-reults-found text-center" *ngIf="rows.length === 0 && dataLoaded">
                <td [attr.colspan]="columns.length" [innerHtml]="config.emptyMessage"></td>
            </tr>
            </tbody>
            <tfoot *ngIf="count">
                <tr>
                    <td [attr.colspan]="columns.length">
                        <div class="dt-footer">
                            <div class="d-flex justify-content-between">
                                <div class="text-left">
                                    <div class="show_per_page">
                                        Show
                                        <md-select floatPlaceholder="never" (change)="showPerPage(limit)" [(ngModel)]="limit">
                                            <md-option [value]="15">15</md-option>
                                        </md-select>
                                    </div>
                                    <div class="show_total_count">
                                        {{ totalRecords }}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <ngb-pagination *ngIf="count > limit" [collectionSize]="count" [(page)]="page" size="sm" [pageSize]="limit" [maxSize]="5" [rotate]="true" [ellipses]="false" [boundaryLinks]="true" (pageChange)="onPage($event)"></ngb-pagination>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>`
,
    styleUrls: ['./datatable.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DataTableX implements OnInit {
    @Input() config: any;
    columns: any[];
    route: any;
    @ContentChild('tablerow') tablerow: TemplateRef<any>;
    @ContentChild('rowGroups') rowGroups: TemplateRef<any>;
    @ContentChild('rowDetails') rowDetails: TemplateRef<any>;
    @ContentChild('selectedBtnsGroups') selectedBtnsGroups: TemplateRef<any>;
    @ContentChild('btnGroups') btnGroups: TemplateRef<any>;
    watchSuccess: Subject<any> = new Subject();
    params: URLSearchParams = new URLSearchParams();
    rowsIndex: number = 0;
    rows: any = [];
    count = 0;
    page: any = 1;
    limit: any = 15;
    dataLoaded = false;
    expandAll = false;
    selectAll = false;
    selectedCount = 0;
    searchItems: any = [];
    searchBy: any;
    sort: any;
    sorting: any = {};
    enableSearch = false;
    searchValue = '';
    totalRecords: any;
    private http: Http;
    constructor(@Inject(Http) http: Http) {
       this.http = http;
    }
    ngOnInit() {
        this.initDataTable();
    }
    initDataTable() {
        this.route = this.config.route;
        if (this.route) {
        this.columns = this.config.columns;
        let searchableCols = this.columns.filter((column: any) => {return (column.searchable === true);});
        this.setFilterColumns(searchableCols)
        this.pagination();
        }
    }
    setFilterColumns(columns: any[]) {
        this.searchItems = columns;
        if (columns && columns.length) {
            this.searchBy = columns[0].searchKey;
        }
    }
    pagination() {
        this.dataLoaded = false;
        if (this.page === 1) {
            this.rowsIndex = 0;
        } else {
            this.rowsIndex = (this.limit * (this.page - 1));
        }
        this.params.set('page', this.page);
        this.params.set('limit', this.limit);
        this.get().subscribe(data => {
            this.dataLoaded = true;
            this.count = data.pagination.total;
            this.rows = data.list;
            this.totalRecords = 'TOTAL: ' + this.count;
            if (this.expandAll) {
                this.expandAll = false;
                this.toggleExpandAll();
            }
            this.watchSuccess.next();
        }, (err) => {
            this.dataLoaded = true;
            console.log('Datatable Error ', err);
        });
    }
    get() {
        return this.http.get(this.route, {
            search: this.params,
            headers: this.config.httpHeaders
        }).timeout(30000)
            .map((res: any) => res.json())
            .do((res: any) => {
                return this.handleSuccess(res);
            })
            .catch((err: any) => {
                return this.handleError(err);
            });
    }
    handleSuccess(data: any) {
        return data;
    }
    handleError(error: any) {
        return error;
    }
    onPage(event: any) {
        this.selectedCount = 0;
        this.selectAll = false;
        this.page = event;
        this.pagination();
    }
    onSearch(event: any) {
        const val = event.target.value;
        this.params.set('search', val);
        this.params.set('search_by', this.searchBy);
        this.page = 1;
        this.pagination();
    }
    clearSearch() {
        this.enableSearch = !this.enableSearch;
        this.searchValue = '';
        this.params.set('search', '');
        this.page = 1;
        this.pagination();
    }
    sortClass(columnName: any): any {
        if (columnName === this.sorting.column) {
            return this.sorting.ascending ? 'sort-icon mdi mdi-arrow-down' : 'sort-icon mdi mdi-arrow-up';
        } else {
            return;
        }
    }
    changeSorting(columnName: any, sortable: any): void {
        if (sortable) {
            let sort = this.sorting;
            if (sort.column == columnName) {
                sort.ascending = !sort.ascending;
            } else {
                sort.column = columnName;
                sort.ascending = true;
            }
            this.params.set('sortby', columnName);
            this.params.set('sortprop', sort.ascending);
            this.page = 1;
            this.pagination();
        }
    }

    showPerPage(val: any) {
        this.searchValue = '';
        this.params.set('search', '');
        this.limit = val;
        this.page = 1;
        this.pagination();
    }
    toggleExpandAll() {
        this.expandAll = !this.expandAll;
        let expand = this.expandAll;
        this.rows.forEach(function (obj: any) {
            obj.expanded = expand;
        });
    }
    onCheckboxChange(row: any): void {
        this.rows.forEach(function (obj: any) {
            if (obj === row) {
                obj.selected = !obj.selected;
            }
        });
        this.selectedCount = this.getSelected().length;
    }
    getSelected() {
        let selected = this.rows.filter((x: any) => x.selected);
        return selected;
    }
    onSelectAll(selectAll: any) {
        this.selectAll = selectAll;
        this.rows.forEach(function (obj: any) {
            obj.selected = selectAll;
        });
        this.selectedCount = this.getSelected().length;
    }
    refresh() {
        this.onSelectAll(false);
        this.pagination();
    }
}