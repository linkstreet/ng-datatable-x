import { Component, OnInit, Input, ViewEncapsulation, ContentChild, TemplateRef, Inject } from '@angular/core';
import { URLSearchParams, Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

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
        this.get().subscribe((data) => {
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
    public onSearch($event: any) {
        for (const item of this.searchItems) {
            this.params.delete('filter[' + item.searchKey + ']');
        }
        this.params.set('filter[' + this.searchBy + ']', $event.target.value);
        this.page = 1;
        this.pagination();
    }
    public clearSearch() {
        this.enableSearch = !this.enableSearch;
        this.searchValue = '';
        for (const item of this.searchItems) {
            this.params.delete('filter[' + item.searchKey + ']');
        }
        this.page = 1;
        this.pagination();
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
            this.params.set('sort_by', columnName);
            this.page = 1;
            this.pagination();
        }
    }
    public setDefaultSorting(columnName: any, sortable: any) {
        if (sortable && columnName) {
            this.sorting.ascending = true;
            this.sorting.column = columnName;
            this.params.set('sort_by', columnName);
            this.sortClass(columnName);
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
        this.onSelectAll(false);
        const index = this.config.defaultSortColumnIndex;
        if (index != null && index >= 0) {
            this.setDefaultSorting(this.columns[index].searchKey, this.columns[index].sortable);
        } else {
            this.sorting.column = '';
            this.params.delete('sort_by');
        }
        this.pagination();
    }
}
