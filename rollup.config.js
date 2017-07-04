import angular from 'rollup-plugin-angular';
import nodeResolve from 'rollup-plugin-node-resolve';
import sass from 'node-sass';
import CleanCSS from 'clean-css';
import { minify as minifyHtml } from 'html-minifier';
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
const cssmin = new CleanCSS();
const htmlminOpts = {
        caseSensitive: true,
        collapseWhitespace: true,
        removeComments: true,
        };
export default {
        entry: './dist/modules/ng-datatable-x.es5.js',
        dest: './dist/bundles/ng-datatable-x.umd.js',
        format: 'umd',
        exports: 'named',
        moduleName: 'ng.NgDataTableX',
        plugins: [
                angular({
                preprocessors: {
                template: template=> minifyHtml(template, htmlminOpts),
                        style: scss=> {
                        const css = sass.renderSync({ data: scss }).css;
                                return cssmin.minify(css).styles;
                        },
                }
                }),
                nodeResolve({ jsnext: true, main: true })],
        external: Object.keys(globals),
        globals: globals,
        onwarn: ()=> { return }
}
