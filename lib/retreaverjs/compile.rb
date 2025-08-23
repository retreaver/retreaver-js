module Retreaver
  class Compile

    class << self
      def perform
        Dir.chdir(root) do |f|
          run("yarn install")
          # compile src
          run("yarn build")
          output = "vendor/assets/javascripts/"
          FileUtils.rm_rf(output)
          FileUtils.mkdir_p(output)
          Dir.glob('dist/*.js') { |f| FileUtils.cp(f, output) }
          # generate jsdocs
          output = "vendor/documentation/javascripts/"
          FileUtils.rm_rf(output)
          FileUtils.mkdir_p(output)
          run("yarn docs")
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
