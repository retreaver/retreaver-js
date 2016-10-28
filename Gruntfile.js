module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'src/retreaver.js',
                    'src/retreaver/base/helpers.js',
                    'src/retreaver/base/cookies.js',
                    'src/retreaver/base/base64.js',
                    'src/retreaver/base/data.js',
                    'src/retreaver/base/model.js',
                    'src/retreaver/base/request.js',
                    'src/retreaver/base/request_number.js',
                    'src/retreaver/cache.js',
                    'src/retreaver/number.js',
                    'src/retreaver/campaign.js',
                    'src/retreaver/callpixels.js',
                    'src/retreaver/vendor/find_and_replace_dom_text.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
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
