import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ContentChild,
  TemplateRef,
  Inject,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject, throwError as observableThrowError } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  catchError,
  timeout,
  tap,
} from "rxjs/operators";
import { FormControl } from "@angular/forms";

@Component({
  selector: "ng-datatable-x",
  styleUrls: ["./datatable.component.scss"],
  templateUrl: "./datatable.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class DataTableXComponent implements OnInit {
  @Input() public config: any;
  public columns: any[];
  public route: any;
  public colSpans: any[];
  @ContentChild("tablerow", { static: false })
  public tablerow: TemplateRef<any>;
  @ContentChild("rowGroups", { static: false })
  public rowGroups: TemplateRef<any>;
  @ContentChild("rowDetails", { static: false })
  public rowDetails: TemplateRef<any>;
  @ContentChild("selectedBtnsGroups", { static: false })
  public selectedBtnsGroups: TemplateRef<any>;
  @ContentChild("btnGroups", { static: false })
  public btnGroups: TemplateRef<any>;
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
  public searchValue = "";
  public totalRecords: any;
  public checkBoxPrefix = Math.random().toString(36).slice(2);
  public spinner = true;
  public ngxError: any;
  private http: HttpClient;
  public searchCtrl: FormControl;
  public sortByColumn: any = [];
  public sortCols: any = [];
  public refreshButton = true;
  constructor(@Inject(HttpClient) http: HttpClient) {
    this.http = http;
    this.searchCtrl = new FormControl();
  }

  public ngOnInit() {
    if (this.config.spinner !== undefined) {
      this.spinner = this.config.spinner;
    }
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((val) => {
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
      this.loadDatatable();
    }
  }

  public loadDatatable() {
    if (this.params["sort_by"]) {
      this.applyParamsSortBy();
    } else {
      const index = this.config.defaultSortColumnIndex;
      if (index != null && index >= 0) {
        this.setDefaultSorting(
          this.columns[index].searchKey,
          this.columns[index].sortable
        );
      }
    }
    if (this.params["filter[search]"]) {
      const searchableCols = this.columns.filter(
        (column: any) => column.searchable === true
      );
      this.setFilterColumns(searchableCols);
      this.searchValue = this.params["filter[search]"];
    } else {
      this.searchValue = "";
      const searchableCols = this.columns.filter(
        (column: any) => column.searchable === true
      );
      this.setFilterColumns(searchableCols);
      for (const item of this.searchItems) {
        delete this.params["filter[" + item.searchKey + "]"];
      }
    }
    this.page = this.params["page"] ? parseInt(this.params["page"]) : 1;
    this.selectedCount = 0;
    this.selectAll = false;
    this.pagination();
  }

  public setFilterColumns(columns: any[]) {
    this.searchItems = columns ?? [];
    if (columns.length) {
      this.searchBy = columns[0].searchKey;
      this.searchName = columns[0].name;
    }
  }

  public applyParamsSortBy(): void {
    let currentSortby = this.params["sort_by"];
    let columnName = currentSortby.startsWith("-")
      ? currentSortby.slice(1)
      : currentSortby;

    if (!currentSortby.startsWith("-")) {
      this.sorting.ascending = true;
      this.sortCols.push({ name: columnName, clicked: 1, direction: 1 });
    } else {
      this.sorting.ascending = false;
      this.sortCols.push({ name: columnName, clicked: 2, direction: -1 });
    }
    this.sorting.column = columnName;
    this.sortByColumn = columnName;
  }

  public pagination() {
    if (this.config.spinner !== undefined) {
      this.spinner = this.config.spinner;
    } else {
      this.spinner = true;
    }
    this.dataLoaded = false;
    if (this.page === 1) {
      this.rowsIndex = 0;
    } else {
      this.rowsIndex = this.limit * (this.page - 1);
    }
    this.params.page = this.page;
    this.params.limit = this.limit;

    this.get().subscribe({
      next: (data: any) => {
        this.dataLoaded = true;
        this.count = data?.pagination?.total;
        this.rows = data.list;
        this.totalRecords = "TOTAL: " + this.count;
        if (this.expandAll) {
          this.expandAll = false;
          this.toggleExpandAll();
        }
        this.watchSuccess.next(data);
      },
      error: (err) => {
        console.log("Datatable API Error:", err);
        this.dataLoaded = true;
      },
    });
  }

  public get() {
    return this.http
      .get(this.route, {
        headers: this.config.httpHeaders,
        params: this.params,
      })
      .pipe(
        timeout(30000),
        tap((res) => this.handleSuccess(res)),
        catchError((err: any) => {
          return this.handleError(err);
        })
      );
  }

  public handleSuccess(data: any) {
    this.spinner = false;
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
    return observableThrowError(error || "Server error");
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
      delete this.params["filter[" + item.searchKey + "]"];
    }
    if (this.searchValue) {
      this.params["filter[" + this.searchBy + "]"] = value;
    }
    this.page = 1;
    this.pagination();
  }

  public clearSearch() {
    this.selectedCount = 0;
    this.selectAll = false;
    this.searchValue = "";
    for (const item of this.searchItems) {
      delete this.params["filter[" + item.searchKey + "]"];
    }
    this.page = 1;
    this.pagination();
  }

  public setDefaultSorting(columnName: any, sortable: any) {
    if (sortable && columnName) {
      if (!this.config.defaultSortOrderDesc) {
        this.sorting.ascending = true;
        this.params.sort_by = columnName;
        this.sortCols.push({ name: columnName, clicked: 1, direction: 1 });
      } else {
        this.sorting.ascending = false;
        this.params.sort_by = "-" + columnName;
        this.sortCols.push({ name: columnName, clicked: 2, direction: -1 });
      }
      this.sorting.column = columnName;
      this.sortByColumn = columnName;
    }
  }

  public sortClass(columnName: any): any {
    if (!this.config.multiSorting) {
      const asc = this.sorting.ascending;
      if (columnName === this.sorting.column) {
        return asc ? "down" : "up";
      } else {
        return;
      }
    } else {
      if (this.sortCols.length > 0) {
        let selectCol = this.filterArray(this.sortCols, "name", columnName);
        if (selectCol) {
          return selectCol.direction === 1 ? "down" : "up";
        } else {
          return;
        }
      } else {
        return;
      }
    }
  }

  public changeSorting(columnName: any, sortable: any): void {
    if (sortable && columnName) {
      this.selectedCount = 0;
      this.selectAll = false;
      if (!this.config.multiSorting) {
        const sort = this.sorting;
        if (sort.column === columnName) {
          sort.ascending = !sort.ascending;
        } else {
          sort.column = columnName;
          sort.ascending = true;
        }
        if (!sort.ascending) {
          columnName = "-" + columnName;
        }
        this.params.sort_by = columnName;
      } else {
        let tmp = this.sortByColumn.length ? this.sortByColumn.split(",") : [];
        const index = tmp.indexOf(columnName);
        if (index >= 0) {
          tmp.splice(index, 1);
        } else {
          tmp.push(columnName);
        }
        this.sortByColumn = tmp.join(",");
        let selectCol = this.sortCols.find(
          (sortCol) => sortCol.name === columnName
        );
        if (selectCol) {
          this.click(selectCol);
          let selectColIndex = this.sortCols.findIndex(
            (sortCol) => sortCol.name === columnName
          );
          this.sortCols.splice(index, 1, selectColIndex);
        } else {
          this.sortCols.push({ name: columnName, clicked: 1, direction: 1 });
        }

        let sortByarr = [];
        this.sortCols.forEach((obj: any) => {
          if (obj.direction !== 0) {
            sortByarr.push(obj.direction === 1 ? obj.name : "-" + obj.name);
          } else {
            if (this.sortCols.length !== 1) {
              const index = this.sortCols.indexOf(obj);
              this.sortCols.splice(index, 1);
            }
          }
        });
        if (sortByarr.length > 0) {
          this.params.sort_by = sortByarr.join();
        } else {
          delete this.params["sort_by"];
          if (this.sortCols[0].direction === 0) {
            this.sortCols[0].direction = 1;
            this.sortCols[0].clicked++;
          }
          const sortByName = this.sortCols[0].name;
          this.params.sort_by =
            this.sortCols[0].direction === 1 ? sortByName : "-" + sortByName;
        }
      }
      this.page = 1;
      this.pagination();
    }
  }

  public filterArray(arr: any[], key: string, value: any) {
    if (arr && arr.length > 0) {
      const obj = arr.filter((trans) => trans[key] === value);
      return obj[0];
    }
    return {};
  }

  public click(selectCol: any) {
    selectCol.clicked++;
    this.chechDirection(selectCol);
  }

  public chechDirection(selectCol: any) {
    const mod = selectCol.clicked % 3;
    switch (mod) {
      case 0:
        selectCol.direction = 0;
        break;
      case 1:
        selectCol.direction = 1;
        break;
      case 2:
        selectCol.direction = -1;
        break;
    }
  }

  public showPerPage(val: any) {
    this.searchValue = "";
    this.params.search = "";
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
    if (this.config.spinner != undefined) {
      this.spinner = this.config.spinner;
    } else {
      this.spinner = true;
    }
    this.onSelectAll(false);
    if (!this.searchValue) {
      this.clearSearch();
    } else {
      this.pagination();
    }
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
