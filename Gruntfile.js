module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist_v1: {
                src: [
                    'src/v1/retreaver.js',
                    'src/v1/retreaver/base/helpers.js',
                    'src/v1/retreaver/base/cookies.js',
                    'src/v1/retreaver/base/base64.js',
                    'src/v1/retreaver/base/data.js',
                    'src/v1/retreaver/base/model.js',
                    'src/v1/retreaver/base/request.js',
                    'src/v1/retreaver/base/request_number.js',
                    'src/v1/retreaver/cache.js',
                    'src/v1/retreaver/number.js',
                    'src/v1/retreaver/campaign.js',
                    'src/v1/retreaver/callpixels.js',
                    'src/v1/retreaver/vendor/find_and_replace_dom_text.js'
                ],
                dest: 'dist/v1/<%= pkg.name %>.js'
            },
            dist_v2: {
                src: [
                    'src/v2/retreaver.js',
                    'src/v2/retreaver/base/helpers.js',
                    'src/v2/retreaver/base/cookies.js',
                    'src/v2/retreaver/base/base64.js',
                    'src/v2/retreaver/base/data.js',
                    'src/v2/retreaver/base/model.js',
                    'src/v2/retreaver/base/request.js',
                    'src/v2/retreaver/base/request_number.js',
                    'src/v2/retreaver/cache.js',
                    'src/v2/retreaver/number.js',
                    'src/v2/retreaver/campaign.js',
                    'src/v2/retreaver/callpixels.js',
                    'src/v2/retreaver/vendor/find_and_replace_dom_text.js'
                ],
                dest: 'dist/v2/<%= pkg.name %>.js'
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist_v1: {
                files: {
                    'dist/v1/<%= pkg.name %>.min.js': ['<%= concat.dist_v1.dest %>']
                }
            },
            dist_v2: {
                files: {
                    'dist/v2/<%= pkg.name %>.min.js': ['<%= concat.dist_v2.dest %>']
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
};
