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
                        <md-select placeholder="Filter By" floatPlaceholder="never" [(ngModel)]="searchBy">
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
                    <th class="w50" nowrap="nowrap" *ngIf="config.selectable">
                        <label class="custom-control custom-checkbox" >
                            <input type="checkbox" class="custom-control-input" [checked]="selectAll" (change)="onSelectAll(selectAll)" [(ngModel)]="selectAll" >
                            <span class="custom-control-indicator"></span>
                        </label>
                    </th>
                    <th class="w50"
                        nowrap="nowrap" *ngIf="config.expandable">
                        <button type="button" 
                                class="btn btn-icon-only expand-row-icon"
                                title="Expand/Collapse All"
                                (click)="toggleExpandAll()">
                            <i class="mdi" [ngClass]='{"mdi-arrow-expand-all":!expandAll, "mdi-arrow-compress-all":expandAll}'></i>
                        </button>
                    </th>
                    <th [attr.class]="config.serialNumber" nowrap="nowrap">
                        Sn
                    </th>
                <ng-template ngFor  let-column [ngForOf]="columns">
                         <th class="{{column.class}}"
                [ngClass]="{'cursor-pointer':column.sortable}"
                (click)="changeSorting(column.name,column.sortable)"
                nowrap="nowrap">
                <ng-template [ngIf]="column.name">
                    <span class="col-title" [innerHtml]="column.name"></span>
                </ng-template>
                <span *ngIf="column.sortable && sortClass(column.name)">
                    <i [class]="sortClass(column.name)"></i>
                </span>
                 
                </th>
            </ng-template>
            </tr>
            </thead>
            <tbody>

            <ng-template ngFor let-n="index" let-row [ngForOf]="rows">
                <tr>
                    <td class="w50" *ngIf="config.selectable">
                        <label class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" [checked]="row.selected" (change)="onCheckboxChange(row)" >
                            <span class="custom-control-indicator"></span>
                        </label>
                    </td>
                    <td class="w50" *ngIf="config.expandable">
                        <button type="button"
                                class="btn btn-icon-only expand-row-icon"
                                title="Expand/Collapse Row"
                                (click)="row.expanded = !row.expanded">
                            <i class="mdi" [ngClass]='{"mdi-chevron-right":!row.expanded, "mdi-chevron-down":row.expanded}'></i>
                        </button>
                    </td>
                    <td [attr.class]="config.serialNumber">
                        {{(n +1) + rowsIndex}}
                    </td>

                <ng-template [ngTemplateOutlet]="rowGroups" [ngOutletContext]="{ $implicit: row }"></ng-template>
                </tr>
                <tr class="expand-row" *ngIf="row.expanded">
                    <td [attr.colspan]="columns.length + 3">
                        <div class="card-block bg-faded">
                            <div class='details'>
                                <ng-template [ngTemplateOutlet]="rowDetails" [ngOutletContext]="{ $implicit: row }"></ng-template>
                            </div>
                        </div>
                    </td>
                </tr>
            </ng-template>
            <tr class="no-reults-found text-center" *ngIf="rows.length === 0 && dataLoaded">
                <td [attr.colspan]="columns.length + 3" [innerHtml]="config.emptyMessage"></td>
            </tr>
            </tbody>
            <tfoot *ngIf="count">
                <tr>
                    <td [attr.colspan]="columns.length + 3">
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
    styles: [`
.datatable {
position: relative;
width: 100%; }
.datatable .table {
margin: 0; }
.datatable .table tr th, .datatable .table tr td {
vertical-align: middle;
padding: .75em; }
.datatable .table tr th:first-child, .datatable .table tr td:first-child {
padding-left: 20px; }
.datatable .table tr th .expand-row-icon, .datatable .table tr td .expand-row-icon {
padding: 0; }
.datatable .table tr th .expand-row-icon:hover, .datatable .table tr td .expand-row-icon:hover {
color: #0275d8 !important; }
.datatable .table tr th .custom-checkbox.custom-control, .datatable .table tr td .custom-checkbox.custom-control {
margin: -.75em 0 0 0;
vertical-align: middle;
padding-left: 18px; }
.datatable .table tr th {
font-size: 12px;
font-family: 'mulibold', 'Helvetica Neue', sans-serif;
color: rgba(0, 0, 0, 0.38);
text-transform: uppercase;
border: 0px; }
.datatable .table tr th .expand-row-icon {
color: rgba(0, 0, 0, 0.38); }
.datatable .table tr th .sort-icon {
font-size: 13px; }
.datatable .table tr td {
font-family: 'muliregular', 'Helvetica Neue', sans-serif;
font-size: 13px; }
.datatable .table tr td.active {
color: #4a90e2;
font-family: 'mulibold', 'Helvetica Neue', sans-serif; }
.datatable .table tr td .mat-icon-button {
height: 24px;
line-height: 24px; }
.datatable .table tr td .mat-icon-button .mat-button-focus-overlay, .datatable .table tr td .mat-icon-button .mat-button-ripple {
display: none !important; }
.datatable .table tr td .mat-icon-button:hover {
color: #0275d8; }
.datatable .table tr td .mat-icon-button .mat-icon {
font-size: 24px; }
.datatable .table tr td .mat-icon-button:focus {
outline: none !important; }
.datatable .table tr:hover td.cursor-pointer {
color: #4a90e2; }
.datatable .table tr.expand-row .card-block {
padding: 10px; }
.datatable .table tr.expand-row > td {
padding: 0; }
.datatable .table tr.no-reults-found td {
padding: 50px 10px 30px 10px; }
.datatable .table tr.no-reults-found h5 {
color: rgba(0, 0, 0, 0.87); }
.datatable .table tr.no-reults-found p {
font-size: 16px;
color: rgba(0, 0, 0, 0.54); }
.datatable .table tfoot td {
font-size: 12px;
font-family: 'mulibold', 'Helvetica Neue', sans-serif;
color: rgba(0, 0, 0, 0.38);
text-transform: uppercase; }
.datatable .table tfoot td:first-child {
padding: 0; }
.datatable .table tfoot td .dt-footer {
padding: 15px 0; }
.datatable .table tfoot td .dt-footer .show_per_page, .datatable .table tfoot td .dt-footer .show_total_count {
display: none;
padding: 0px 20px;
font-family: 'mulibold', 'Helvetica Neue', sans-serif; }
.datatable .table tfoot td .dt-footer .show_per_page .mat-select, .datatable .table tfoot td .dt-footer .show_total_count .mat-select {
display: inline-block !important;
padding-left: 5px;
vertical-align: super; }
.datatable .table tfoot td .dt-footer .show_per_page .mat-select .mat-select-value, .datatable .table tfoot td .dt-footer .show_total_count .mat-select .mat-select-value {
font-family: 'mulisemibold', 'Helvetica Neue', sans-serif; }
.datatable .table tfoot td .dt-footer .show_per_page .mat-select .mat-select-trigger, .datatable .table tfoot td .dt-footer .show_total_count .mat-select .mat-select-trigger {
min-width: 40px; }
.datatable .table tfoot td .dt-footer .show_per_page .mat-select .mat-select-underline, .datatable .table tfoot td .dt-footer .show_total_count .mat-select .mat-select-underline {
display: none; }
.datatable .table tfoot td .dt-footer .show_total_count {
display: block; }
.datatable .table tfoot td .dt-footer ngb-pagination {
display: block; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination {
margin-bottom: 0;
padding: 0 20px; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item.disabled .page-link {
color: #b7b7b7;
cursor: no-drop;
pointer-events: initial; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item .page-link {
font-size: 17px;
color: rgba(0, 0, 0, 0.54);
border-color: transparent;
padding: 0 7px;
display: inline-block;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
height: 26px;
width: 25px; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item .page-link:hover {
background-color: transparent !important; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item .page-link span {
display: none; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item.active .page-link {
background-color: transparent;
color: #0275d8; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="First"] {
font: normal normal normal 24px/1 "Material Design Icons";
font-size: 24px;
padding: 0px;
color: #0275d8; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="First"]::before {
content: "\\F4AE";
visibility: visible; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Previous"] {
font: normal normal normal 24px/1 "Material Design Icons";
font-size: 23px;
padding: 0px;
color: #0275d8; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Previous"]::before {
content: "\\F141";
visibility: visible; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Next"] {
font: normal normal normal 24px/1 "Material Design Icons";
font-size: 23px;
padding: 0px;
color: #0275d8; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Next"]::before {
content: "\\F142";
visibility: visible; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Last"] {
display: inline-block;
font: normal normal normal 24px/1 "Material Design Icons";
font-size: 24px;
padding: 0;
color: #0275d8; }
.datatable .table tfoot td .dt-footer ngb-pagination .pagination .page-item a[aria-label="Last"]::before {
content: "\\F4AD";
visibility: visible; }
.datatable .table .w200 {
width: 200px; }
.datatable .table .w175 {
width: 175px; }
.datatable .table .w150 {
width: 150px; }
.datatable .table .w125 {
width: 125px; }
.datatable .table .w100 {
width: 100px; }
.datatable .table .w75 {
width: 75px; }
.datatable .table .w50 {
width: 50px; }
.datatable .details {
background: #fff;
padding: 15px 5px 1px 15px; }
.datatable .details dt {
font-size: 11px;
margin-bottom: .5rem;
text-transform: uppercase; }
`],
    encapsulation: ViewEncapsulation.None
})
export class DataTableX implements OnInit {
    @Input() public config: any;
    public columns: any[];
    public route: any;
    @ContentChild('tablerow') public tablerow: TemplateRef<any>;
    @ContentChild('rowGroups') public rowGroups: TemplateRef<any>;
    @ContentChild('rowDetails') public rowDetails: TemplateRef<any>;
    @ContentChild('selectedBtnsGroups') public selectedBtnsGroups: TemplateRef<any>;
    @ContentChild('btnGroups') public btnGroups: TemplateRef<any>;
    public watchSuccess: Subject<any> = new Subject();
    public params: URLSearchParams = new URLSearchParams();
    public rowsIndex: number = 0;
    public rows: any = [];
    public count = 0;
    public page: any = 1;
    public limit: any = 15;
    public dataLoaded = false;
    public expandAll = false;
    public selectAll = false;
    public selectedCount = 0;
    public searchItems: any = [];
    public searchBy: any;
    public sort: any;
    public sorting: any = {};
    public enableSearch = false;
    public searchValue = '';
    public totalRecords: any;
    private http: Http;
    constructor(@Inject(Http) http: Http) {
       this.http = http;
    }
    public ngOnInit() {
        this.initDataTable();
    }
    public initDataTable() {
        this.route = this.config.route;
        this.columns = this.config.columns;
        if (this.route) {
            let searchableCols = this.columns.filter((column: any) => {return (column.searchable === true);});
            this.setFilterColumns(searchableCols)
            this.pagination();
        }
    }
    public setFilterColumns(columns: any[]) {
        this.searchItems = columns;
        if (columns && columns.length) {
            this.searchBy = columns[0].searchKey;
        }
    }
    public pagination() {
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
        });
    }
    public get() {
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
    public handleSuccess(data: any) {
        return data;
    }
    public handleError(error: any) {
        return error;
    }
    public onPage(event: any) {
        this.selectedCount = 0;
        this.selectAll = false;
        this.page = event;
        this.pagination();
    }
    public onSearch(event: any) {
        const val = event.target.value;
        this.params.set('search', val);
        this.params.set('search_by', this.searchBy);
        this.page = 1;
        this.pagination();
    }
    public clearSearch() {
        this.enableSearch = !this.enableSearch;
        this.searchValue = '';
        this.params.set('search', '');
        this.page = 1;
        this.pagination();
    }
    public sortClass(columnName: any): any {
        if (columnName === this.sorting.column) {
            return this.sorting.ascending ? 'sort-icon mdi mdi-arrow-down' : 'sort-icon mdi mdi-arrow-up';
        } else {
            return;
        }
    }
    public changeSorting(columnName: any, sortable: any): void {
        if (sortable) {
            let sort = this.sorting;
            if (sort.column === columnName) {
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
    public showPerPage(val: any) {
        this.searchValue = '';
        this.params.set('search', '');
        this.limit = val;
        this.page = 1;
        this.pagination();
    }
    public toggleExpandAll() {
        this.expandAll = !this.expandAll;
        let expand = this.expandAll;
        this.rows.forEach(function (obj: any) {
            obj.expanded = expand;
        });
    }
    public onCheckboxChange(row: any): void {
        this.rows.forEach(function (obj: any) {
            if (obj === row) {
                obj.selected = !obj.selected;
            }
        });
        this.selectedCount = this.getSelected().length;
    }
    public getSelected() {
        let selected = this.rows.filter((x: any) => x.selected);
        return selected;
    }
    public onSelectAll(selectAll: any) {
        this.selectAll = selectAll;
        this.rows.forEach(function (obj: any) {
            obj.selected = selectAll;
        });
        this.selectedCount = this.getSelected().length;
    }
    public refresh() {
        this.onSelectAll(false);
        this.pagination();
    }
}
