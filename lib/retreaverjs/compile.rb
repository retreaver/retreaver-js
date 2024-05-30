module Retreaver
  class Compile

    class << self
      def perform
        Dir.chdir(root) do |f|
          run("npm install") unless Dir.exist?('./node_modules')
          # compile src
          run("npx --yes grunt-cli")
          output = 'vendor/assets/javascripts/'
          FileUtils.rm_rf(output)
          FileUtils.mkdir_p(output)
          Dir.glob('dist/v*') { |f| FileUtils.cp_r(f, output) }
          # generate jsdocs
          output = 'vendor/documentation/javascripts/'
          FileUtils.rm_rf(output)
          run("./node_modules/.bin/jsdoc -c config/jsdocs-v1.json")
          run("./node_modules/.bin/jsdoc -c config/jsdocs-v2.json")
        end
      end

      def run(command)
        puts(command)
        system_with_abort(command)
      end

      def system_with_abort(command, abort_message=nil)
        system(command, out: $stdout, err: :out)
        abort_message ||= "Error executing: '#{command}'"
        abort abort_message unless $?.success?
      end

      def root
        File.expand_path(File.join(__FILE__, '../../../'))
      end
    end

  end
end
