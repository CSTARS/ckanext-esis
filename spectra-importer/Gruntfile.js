'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-vulcanize');


    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'app',
            dist: 'dist',
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
                root : '<%= yeoman.app %>/editor',
                dest: '<%= yeoman.dist %>/editor',
                verbose : true
            },
            html: '<%= yeoman.app %>/editor/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= yeoman.dist %>/editor']
            },
            html: ['<%= yeoman.dist %>/editor/{,*/}*.html']
            //css: ['<%= yeoman.dist %>/css/{,*/}*.css']
        },


        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/editor',
                    dest: '<%= yeoman.dist %>/editor',
                    src: [
                        '*.{html,handlebars}',
                        'styles/**'
                    ]
                },
                {
                    expand: true,
                    dot: true,
                    src: ['schema.json','metadata_map'],
                    dest: '<%= yeoman.dist %>',
                    cwd: '<%= yeoman.app %>'
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
                    '<%= yeoman.app %>/editor/elements.html': ['<%= yeoman.dist %>/editor/elements.html']
                }
            }
        },

    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy:dist',
        'useminPrepare',
        'concat:generated',
        //'cssmin:generated',
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
