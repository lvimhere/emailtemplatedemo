var path = require('path');
var gulp = require('gulp');
var changed = require('gulp-changed');
var filter = require('gulp-filter');
var plumber = require('gulp-plumber');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var watch = require('gulp-watch');

var notify = require('gulp-notify');

var ora = require('ora');
var spinner = ora('Loading sources').start();
//路径
//
// spinner.start();
var src_path = {
  html : path.resolve(__dirname,'src/*.html'),
  js_lib : path.resolve(__dirname,'src/js/libs/*.js'),
  js_page: path.resolve(__dirname, 'src/js/page/*.js'),
  js_plugins: path.resolve(__dirname, 'src/js/plugins/*.*'),
  css_lib: path.resolve(__dirname, 'src/css/lib/*.*'),
  css_page: path.resolve(__dirname, 'src/css/*.scss'),
  img: path.resolve(__dirname, 'src/img/*.*'),
  fonts: path.resolve(__dirname, 'src/fonts/*.*')
}
var build_path = {
  js_lib : path.resolve(__dirname,'build/js/libs/*.js'),
  js_page: path.resolve(__dirname, 'build/js/page/*.js'),
  js_plugins: path.resolve(__dirname, 'build/js/plugins/*.*'),
  css_lib: path.resolve(__dirname, 'build/css/lib/*.*'),
  css_page: path.resolve(__dirname, 'build/css/*.scss'),
  img: path.resolve(__dirname, 'build/img'),
  fonts: path.resolve(__dirname, 'src/fonts/*.*')
}

//本地服务器配置
var serverConfig = {
  server: {
    baseDir: "./build"
  },
  host: '127.0.0.1',
  port: 8081
}

var htmlmin = require('gulp-htmlmin');

var sass = require('gulp-sass');
var cssmin = require('gulp-clean-css');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var prefixer = require('gulp-autoprefixer');
var nano = require('gulp-cssnano');


var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var uglify_config = {
  mangle: {
    except: ['define', 'require', 'module', 'exports', '_hmt']
  },
  compress: true
}


var imagemin = require('gulp-imagemin');

var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

var sourcemaps = require('gulp-sourcemaps');

var del = require('del');


//html
//
//
gulp.task('htmlmin', function () {
  return gulp.src(src_path.html,{base:'src'})
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    //.pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyJS: true }))
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream:true}))
});

gulp.task('scssmin',()=>{
  return gulp.src(src_path.css_page,{base:'src'})
    .pipe(changed('./build'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(prefixer(['iOS >= 7', 'Android >= 4.1']))
    .pipe(gulp.dest('./build'))
    .pipe(reload({ stream: true }))
  })


gulp.task('cssmin',()=>{
  return gulp.src(src_path.css_lib,{base:'src'})
  .pipe(changed('./build'))
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  .pipe(cssmin())
  .pipe(gulp.dest('./build'))
  .pipe(reload({stream:true}))
  })
gulp.task('build:style',function(){
  return gulp.src(src_path.css_page,{base:'src'})
             .pipe(sass().on('error',function(e){
                console.error(e.message)
                this.emit('end')
              }))
             .pipe(postcss([autoprefixer(['iOS >= 7','Android >= 4.1'])]))
             //.pipe(nano({zindex:false,autoprefixer:false,safe:true}))
             .pipe(cssmin())
             .pipe(gulp.dest('./build'))
             .pipe(reload({stream:true}))
  })




  gulp.task('imagemin',()=>{
  return gulp.src(src_path.img,{base:'src'})
    .pipe(changed('./build'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(imagemin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true ////类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('./build'))
})


gulp.task('jsmin',()=>{
  return gulp.src(src_path.js_page,{base:'src'})
    .pipe(changed('./build'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(babel({presets:["es2015"]}))
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream:true}))
})


gulp.task('jsplugins',()=>{
  return gulp.src([src_path.js_lib,src_path.js_plugins],{base:'src'})
    .pipe(changed('./build'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
    .pipe(reload({stream:true}))
  })

  // 1.  调试，测试环境
gulp.task('default',['serve'],()=>{
  console.log('all tasks completed!');
  })
gulp.task('serve',['htmlmin','build:style','cssmin','jsmin','jsplugins','imagemin'],()=>{
  spinner.color = 'yellow';
  spinner.text = 'bootstrap server';
  spinner.succeed();
  //开启本地服务器
  browserSync.init(serverConfig);
  //要监视的文件
  watch(src_path.html,()=>{
    gulp.start('htmlmin');
    })
  watch(src_path.css_page,()=>{
    gulp.start('build:style');
    })
  watch(src_path.css_lib,()=>{
    gulp.start('cssmin');
    })
  watch(src_path.img,()=>{
    gulp.start('imagemin');
  })
  watch(src_path.js_page,()=>{
    gulp.start('jsmin');
  })
  watch([src_path.js_lib,src_path.js_plugins],()=>{
    gulp.start('jsplugins');
    })
})





  //2. 发布版本

gulp.task('rev_html',()=>{
  return gulp.src(src_path.html,{base:'src'})
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyJS: true }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('rev_css',()=>{
  return gulp.src([src_path.css_page,src_path.css_lib],{base:'src'})
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass())
    .pipe(postcss([autoprefixer(['iOS >= 7','Android >= 4.1'])]))
    .pipe(nano({
      zindex:false,
      autoprefixer:false
      }))
    .pipe(rev())
    .pipe(gulp.dest('./dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev/css'))
})

gulp.task('rev_js',()=>{
  return gulp.src('./src/js/page/*.js',{base:'src'})
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(babel({presets:["es2015"]}))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev/js'))
})


gulp.task('rev_jsplugins',()=>{
  return gulp.src([src_path.js_lib,src_path.js_plugins],{base:'src'})
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./rev/js/plugins'))
})

gulp.task('rev_imagemin',()=>{
  return gulp.src([src_path.img,'./src/css/**/*.png'],{base:'src'})
    .pipe(changed('./dist'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(imagemin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true ////类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('rev_fonts',()=>{
  return gulp.src(src_path.fonts,{base:'src'})
    .pipe(changed('./dist'))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(imagemin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true ////类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('./dist'))
})



gulp.task('rev',['rev_html','rev_css','rev_js','rev_jsplugins','rev_imagemin','rev_fonts'],()=>{
  spinner.color = 'yellow';
  spinner.text = 'construct rev';
})


gulp.task('revCollector_html',['rev'],()=>{
  spinner.color = 'yellow';
  spinner.text = 'construct';
  return gulp.src(['./rev/**/*.json','./dist/**/*.html'],{base:'src'})
    .pipe(revCollector({replaceReved: true}))
    .pipe(gulp.dest('./dist'))
})


gulp.task('revCollector_js',['rev'],()=>{
  spinner.color = 'yellow';
  spinner.text = 'construct';
  return gulp.src(['./rev/**/*.json','dist/js/**/*.js'],{base:'src'})
    .pipe(revCollector({replaceReved: true}))
    .pipe(gulp.dest('./dist'))
})

gulp.task('dist',['revCollector_html','revCollector_js'],()=>{
  spinner.color = 'green';
  spinner.text = 'dist done!';
  spinner.succeed();
})



//del
gulp.task('del_rev',['dist'],()=>{
  del(path.resolve(__dirname,'rev'))
  })

gulp.task('del_build',()=>{
  spinner.text = 'delete build';
  spinner.color = 'red';
  spinner.succeed()
  // del([path.resolve(__dirname,'build/**'),!path.resolve(__dirname,'build'),!path.resolve(__dirname,'build/img'),!path.resolve(__dirname,'build/fonts')])
  del(['./build/**','!./build','!./build/img/**','!./build/fonts'])
});
