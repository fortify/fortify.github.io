var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('npm-components', function(){
    gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css',
             './node_modules/quantum-ux-bootstrap/dist/css/bootstrap.min.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/alert/qtm-bs3-alert.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/breadcrumbs/qtm-bs3-breadcrumbs.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/button/qtm-bs3-button.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/panel/qtm-bs3-panel.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/checkbox/qtm-bs3-checkbox.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/form/qtm-bs3-form.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/input/qtm-bs3-input.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/list/qtm-bs3-list.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/login/qtm-bs3-login.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/modal/qtm-bs3-modal.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/navigation/qtm-bs3-navigation.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/progress/qtm-bs3-progress.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/radio/qtm-bs3-radio.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/slider/qtm-bs3-slider.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/table/qtm-bs3-table.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/tag/qtm-bs3-tag.css',
             './node_modules/quantum-ux-bootstrap/dist/bootstrap3/css/toolbar/qtm-bs3-toolbar.css',
             './css/site.css'
        ]).pipe(concat('styles.css'))
          .pipe(gulp.dest('./dist/css'));

        gulp.src([
            './node_modules/quantum-ux-bootstrap/dist/common/css/qtm-fonts.css'
        ]).pipe(gulp.dest('./dist/fonts'));

        gulp.src([
            './node_modules/quantum-ux-bootstrap/dist/common/css/qtm-icons.css',
            './node_modules/quantum-ux-bootstrap/dist/common/css/qtm-font-icons.css',
        ]).pipe(gulp.dest('./dist/icons'));

        gulp.src([
            './node_modules/jquery/dist/jquery.min.js',
        ]).pipe(gulp.dest('./dist/js'));
});

gulp.task('default',['npm-components']);

