import resolve from 'rollup-plugin-node-resolve';
// Add here external dependencies that actually you use.
const globals = {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs/Observable': 'Rx',
        'rxjs/Observer': 'Rx',
        'rxjs/add/operator/map': 'Rx',
        'rxjs/Subject': 'Subject',
        'rxjs/Subscription': 'Subscription',
        'rxjs/operator/map': 'Rx',
        'rxjs/operator/do': 'Rx',
        'rxjs/operator/let': 'Rx',
        'rxjs/observable/forkJoin': 'Rx',
        'rxjs/observable/fromPromise': 'Rx',
        'rxjs/observable/fromEvent': 'Rx'
};

export default {
        entry: './dist/modules/ng-datatable-x.es5.js',
        dest: './dist/bundles/ng-datatable-x.umd.js',
        format: 'umd',
        exports: 'named',
        moduleName: 'ng.NgDataTableX',
        plugins: [resolve()],
        external: Object.keys(globals),
        globals: globals,
        onwarn: ()=> { return }
}
