module Retreaver
  class Compile

    class << self
      def perform
        Dir.chdir(root) do |f|
          run("npm install") unless Dir.exist?('./node_modules')
          # compile src
          run("grunt")
          output = 'vendor/assets/javascripts/'
          FileUtils.rm_rf(output)
          FileUtils.mkdir_p(output)
          Dir.glob('dist/*.js') { |f| FileUtils.cp(f, output) }
          # generate jsdocs
          output = 'vendor/documentation/javascripts/'
          FileUtils.rm_rf(output)
          run("./node_modules/.bin/jsdoc -c config/jsdocs.json")
        end
      end

      def run(command)
        puts(command)
        system(command)
      end

      def root
        File.expand_path(File.join(__FILE__, '../../../'))
      end
    end

  end
end
