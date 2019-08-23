import { Component, OnInit, Input, ViewEncapsulation, ContentChild, TemplateRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, throwError as observableThrowError } from 'rxjs';
import { catchError, timeout, tap } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'ng-datatable-x',
    styleUrls: ['./datatable.component.scss'],
    templateUrl: './datatable.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DataTableXComponent implements OnInit {
    @Input() public config: any;
    public columns: any[];
    public route: any;
    public colSpans: any[];
    @ContentChild('tablerow', { static: false }) public tablerow: TemplateRef<any>;
    @ContentChild('rowGroups', { static: false }) public rowGroups: TemplateRef<any>;
    @ContentChild('rowDetails', { static: false }) public rowDetails: TemplateRef<any>;
    @ContentChild('selectedBtnsGroups', { static: false }) public selectedBtnsGroups: TemplateRef<any>;
    @ContentChild('btnGroups', { static: false }) public btnGroups: TemplateRef<any>;
    public watchSuccess: Subject<any> = new Subject();
    public watchError: Subject<any> = new Subject();
    public params: any = {};
    public rowsIndex: number = 0;
    public rows: any = [];
    public count = 0;
    public page: any = 1;
    public limit: any = 15;
    public dataLoaded = false;
    public expandAll = false;
    public selectAll = false;
    public selectedCount = 0;
    public addSearch = false;
    public searchItems: any = [];
    public searchBy: any;
    public searchName: any;
    public sort: any;
    public sorting: any = {};
    public enableSearch = false;
    public searchValue = '';
    public totalRecords: any;
    public checkBoxPrefix = Math.random().toString(36).slice(2);
    public spinner = true;
    public ngxError: any;
    private http: HttpClient;
    public searchCtrl: FormControl;
    constructor(@Inject(HttpClient) http: HttpClient) {
        this.http = http;
        this.searchCtrl = new FormControl();
    }
    public ngOnInit() {
        if (this.config.spinner != undefined) {
            this.spinner = this.config.spinner;
        }
        this.searchCtrl.valueChanges.pipe(debounceTime(300),
            distinctUntilChanged()).subscribe(val => {
                if (this.addSearch) {
                    this.onSearch(val);
                }
            });
        this.initDataTable();
    }
    public initDataTable() {
        this.route = this.config.route;
        this.columns = this.config.columns;
        this.colSpans = this.config.colSpans;
        if (this.route) {
            const searchableCols = this.columns.filter((column: any) => (column.searchable === true));
            this.setFilterColumns(searchableCols);
            const index = this.config.defaultSortColumnIndex;
            if (index != null && index >= 0) {
                this.setDefaultSorting(this.columns[index].searchKey, this.columns[index].sortable);
            }
            this.pagination();
        }
    }
    public setFilterColumns(columns: any[]) {
        this.searchItems = columns;
        if (columns && columns.length) {
            this.searchBy = columns[0].searchKey;
            this.searchName = columns[0].name;
        }
    }
    public pagination() {
        this.dataLoaded = false;
        if (this.page === 1) {
            this.rowsIndex = 0;
        } else {
            this.rowsIndex = (this.limit * (this.page - 1));
        }
        this.params.page = this.page;
        this.params.limit = this.limit;
        this.get().subscribe((data: any) => {
            this.dataLoaded = true;
            if (data && data.pagination) {
                this.count = data.pagination.total;
            }
            this.rows = data.list;
            this.totalRecords = 'TOTAL: ' + this.count;
            if (this.expandAll) {
                this.expandAll = false;
                this.toggleExpandAll();
            }
            this.watchSuccess.next(data);
        }, (err) => {
            this.dataLoaded = true;
        });
    }
    public get() {
        return this.http.get(this.route, {
            headers: this.config.httpHeaders,
            params: this.params
        }).pipe(timeout(30000),
            tap(res => {
                this.spinner = false;
                return this.handleSuccess(res);
            }),
            catchError((err) => {
                return this.handleError(err);
            }),
        );
    }
    public handleSuccess(data: any) {
        this.ngxError = {};
        setTimeout(() => {
            this.addSearch = true;
        }, 350);
        return data;
    }
    public handleError(error: any) {
        this.spinner = false;
        this.ngxError = error;
        this.watchError.next(error);
        return observableThrowError(error || 'Server error');
    }
    public onPage(event: any) {
        this.selectedCount = 0;
        this.selectAll = false;
        this.page = event;
        this.pagination();
    }
    public onSearch(value: any) {
        this.selectedCount = 0;
        this.selectAll = false;
        for (const item of this.searchItems) {
            delete this.params['filter[' + item.searchKey + ']'];
        }
        if (this.searchValue) {
            this.params['filter[' + this.searchBy + ']'] = value;
        }
        this.page = 1;
        this.pagination();
    }
    public clearSearch() {
        this.selectedCount = 0;
        this.selectAll = false;
        this.enableSearch = !this.enableSearch;
        this.searchValue = '';
        for (const item of this.searchItems) {
            delete this.params['filter[' + item.searchKey + ']'];
        }
        this.page = 1;
        this.pagination();
    }
    public loadDatatable() {
        this.clearSearch();
    }
    public sortClass(columnName: any): any {
        const iconClass = 'sort-icon mdi ';
        const asc = this.sorting.ascending;
        if (columnName === this.sorting.column) {
            return asc ? iconClass + 'mdi-arrow-down' : iconClass + 'mdi-arrow-up';
        } else {
            return;
        }
    }
    public changeSorting(columnName: any, sortable: any): void {
        if (sortable && columnName) {
            this.selectedCount = 0;
            this.selectAll = false;
            const sort = this.sorting;
            if (sort.column === columnName) {
                sort.ascending = !sort.ascending;
            } else {
                sort.column = columnName;
                sort.ascending = true;
            }
            if (!sort.ascending) {
                columnName = '-' + columnName;
            }
            this.params.sort_by = columnName;
            this.page = 1;
            this.pagination();
        }
    }
    public setDefaultSorting(columnName: any, sortable: any) {
        if (sortable && columnName) {
            if (!this.config.defaultSortOrderDesc) {
                this.sorting.ascending = true;
                this.params.sort_by = columnName;
            } else {
                this.sorting.ascending = false;
                this.params.sort_by = '-' + columnName;
            }
            this.sorting.column = columnName;
            this.sortClass(columnName);
        }
    }
    public showPerPage(val: any) {
        this.searchValue = '';
        this.params.search = '';
        this.limit = val;
        this.page = 1;
        this.pagination();
    }
    public toggleExpandAll() {
        this.expandAll = !this.expandAll;
        const expand = this.expandAll;
        this.rows.forEach((obj: any) => {
            obj.expanded = expand;
        });
    }
    public onCheckboxChange(row: any): void {
        this.rows.forEach((obj: any) => {
            if (obj === row) {
                obj.selected = !obj.selected;
            }
        });
        this.selectedCount = this.getSelected().length;
    }
    public getSelected() {
        return this.rows.filter((x: any) => x.selected);
    }
    public onSelectAll(selectAll: any) {
        this.selectAll = selectAll;
        this.rows.forEach((obj: any) => {
            obj.selected = selectAll;
        });
        this.selectedCount = this.getSelected().length;
    }
    public refresh() {
        this.spinner = true;
        this.onSelectAll(false);
        if (this.enableSearch) {
            this.clearSearch();
        }
        this.pagination();
    }
    public onSearchDropdown() {
        for (const item of this.searchItems) {
            if (item.searchKey === this.searchBy) {
                this.searchName = item.name;
            }
        }
        this.onSearch(this.searchValue);
    }
}
