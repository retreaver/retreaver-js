# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'retreaverjs/rails/version'

Gem::Specification.new do |spec|
  spec.name          = "retreaverjs-rails"
  spec.version       = Retreaver::Rails::VERSION
  spec.authors       = ['Blake Hilscher', 'Jason Kay']
  spec.email         = ['blake@hilscher.ca', 'jason@retreaver.com']
  spec.summary       = %q{retreaver.js rails wrapper}
  spec.description   = %q{retreaver.js rails wrapper}
  spec.homepage      = ""
  spec.license       = "GPLv3"

  spec.files = Dir["{lib,config,vendor,src}/**/*"] + ["LICENSE", "README.md"] + [
      'Gruntfile.js', 'LICENSE', 'package.json', 'Rakefile', 'README.md']
  
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]
  
  spec.add_dependency "railties"
  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "pry"
end
