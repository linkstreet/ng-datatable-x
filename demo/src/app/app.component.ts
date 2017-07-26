import { Component, ViewChild } from '@angular/core';
import { DataTableXComponent } from '@linkstreet/ng-datatable-x';
import 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  @ViewChild('dataTable') dt: DataTableXComponent;
  columns: any = [
        {name: 'Name', sortable: true, class: '', searchable: true, searchKey: 'first_name'},
        {name: 'Email', sortable: true, class: 'hidden-md-down', searchable: true, searchKey: 'email'},
        {name: 'Mobile No', sortable: true, class: 'hidden-md-down', searchKey: 'mobile_number'},
        {name: 'Added On', sortable: true, class: 'hidden-md-down', searchKey: 'created_at'},
        {name: 'Role', sortable: false, class: 'hidden-xs-down'},
        {name: 'Status', sortable: true, class: 'hidden-xs-down', searchKey: 'status'},
        {name: 'Action', sortable: false, class: 'w75 text-center'}
    ];
    dtInfo: any = {
        columns: this.columns,
        route: 'https://api.mockaroo.com/api/b528fa90?count=5&key=51ff8030',
        emptyMessage: '<h5>No users available</h5><p>Please add a new user</p>',
        navbarVisible: true,
        headerVisible: true,
        search: true,
        selectable: true,
        expandable: true,
        serialNumber: 'w50'
    };
    ngOnInit() {
        this.dt.limit = 5;
        this.dt.watchSuccess.subscribe((data: any) => {
            if (data) {
                this.dt.rows = data;
                this.dt.count = 50;
                this.dt.totalRecords = 'TOTAL: ' + this.dt.count;
            }
        });
    }
}
