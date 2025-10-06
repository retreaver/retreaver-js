module Retreaver
  class Compile

    class << self
      def perform
        Dir.chdir(root) do |f|
          run("corepack yarn install")
          # compile src

          run("corepack yarn build")
          vendor_js_dir = "vendor/assets/javascripts/"
          FileUtils.rm_rf(vendor_js_dir)
          FileUtils.mkdir_p(vendor_js_dir)
          Dir.glob("dist/*.js") { |f| FileUtils.cp(f, vendor_js_dir) }
          # generate jsdocs
          vendor_js_docs_dir = "vendor/documentation/javascripts/"
          FileUtils.rm_rf(vendor_js_docs_dir)
          FileUtils.mkdir_p(vendor_js_docs_dir)
          run("corepack yarn docs") # output dest is defined in config/jsdocs.json
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
