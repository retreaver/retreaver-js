require "bundler/gem_tasks"
require 'fileutils'
require_relative 'lib/retreaverjs/compile.rb'

namespace :retreaverjs do
  desc "compile retreaverjs"
  task :compile do
    Retreaver::Compile.perform
  end
end

task :before_build do
  Rake::Task["retreaverjs:compile"].execute
end

task :build => :before_build