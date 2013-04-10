module.exports = function(grunt) {

  var source = [
    './src/domtemp.js',
    './src/attr-scanner.js',
    './src/form-scanner.js',
    './src/loop-scanner.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: source,
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> @version <%= pkg.version%> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + 
          '/* @author: <%= pkg.author.name%> <<%= pkg.author.email%>> */\n' +
          '/* @see https://github.com/lichangwei/domtemp */\n',
        sourceMap: '<%= pkg.name %>.min.js.map'
      },
      build: {
        src: source,
        dest: '<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/index.html']
    },
    jshint: {
      files: source,
      options: {
        globals: {
          jQuery: true,
          console: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    },
    pkg2cmp: {
      target: {}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-plugin-pkg2cmp');

  grunt.registerTask('default', ['pkg2cmp', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('test', ['qunit']);

};