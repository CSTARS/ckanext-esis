'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-vulcanize');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-browserify');

    var files = {
      'app/import/scripts/bundle.js': ['core/app.js']
    };

    var browserifyOptions = {
      debug : true, // include source maps
      standalone : 'Ecosis'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'app',
            dist: 'dist',
        },

        browserify : {
          build: {
            files: files,
            options: {
              browserifyOptions : browserifyOptions
            }
          },
          watch : {
            files: files,
            options: {
              browserifyOptions : browserifyOptions,
              keepAlive : true,
              watch : true,
              debug : true
            }
          }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                root : '<%= yeoman.app %>/import',
                dest: '<%= yeoman.dist %>/import',
                verbose : true
            },
            html: '<%= yeoman.app %>/import/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= yeoman.dist %>/import']
            },
            html: ['<%= yeoman.dist %>/import/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/import/{,*/}*.css']
        },


        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/import',
                    dest: '<%= yeoman.dist %>/import',
                    src: [
                        '*.{html,handlebars}'
                    ]
                },
                {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/assets',
                    dest: '<%= yeoman.dist %>/assets',
                    src: [
                        '{,*/}*'
                    ]
                },
                {
                    expand: true,
                    dot: true,
                    src: ['metadata_map'],
                    dest: '<%= yeoman.dist %>',
                    cwd: '<%= yeoman.app %>'
                },
                {
                    expand: true,
                    dot: true,
                    src: '*.*',
                    dest: '<%= yeoman.dist %>/import/fonts',
                    cwd: '<%= yeoman.app %>/import/components/font-awesome/fonts'
                }]
            }
        },


        shell: {
            server : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node server --dev'
            },
            'build-server' : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node server'
            },
            'tutorial-server' : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node server --tutorial'
            }
        },

        vulcanize: {
            default : {
                options: {
                    inline : true
                },
                files : {
                    '<%= yeoman.dist %>/import/elements.html': ['<%= yeoman.app %>/import/elements.html']
                }
            }
        },

    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy:dist',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        //'rev',
        'usemin',
        'vulcanize'
    ]);

    grunt.registerTask('server', [
        'shell:server'
    ]);

    grunt.registerTask('build-server', [
        'build',
        'shell:build-server'
    ]);

    grunt.registerTask('tutorial-server', [
        'shell:tutorial-server'
    ]);

};
