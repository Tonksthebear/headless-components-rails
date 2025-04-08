# desc "Explaining what the task does"
# task :headless_view_component do
#   # Task goes here
# end

require "yaml"
require_relative "../headless_view_component/utility_classes_generator"
require_relative "../headless_view_component/parser/jsx_parser"

namespace :headless_view_component do
  def load_headless_view_components
    components_dir = HeadlessViewComponent::Engine.root.join("app/components")
    component_files = Dir.glob("#{components_dir}/**/*_component.rb")

    component_files.each do |file|
      begin
        require file
      rescue StandardError => e
        puts "Warning: Could not load #{file} - #{e.message}"
      end
    end
  end

  desc "Generate utility_classes.yml in the host app's config directory"
  task generate_utility_classes: :environment do
    catalyst_path = ENV["catalyst_path"] || Rails.root.join("catalyst-ui-kit")

    unless File.directory?(catalyst_path)
      puts "Error: Catalyst UI Kit directory not found at #{catalyst_path}"
      puts "Please provide the correct path to the catalyst-ui-kit directory"
      exit 1
    end

    javascript_dir = File.join(catalyst_path, "javascript")
    unless File.directory?(javascript_dir)
      puts "Error: JavaScript directory not found at #{javascript_dir}"
      puts "Please ensure the catalyst-ui-kit directory contains a 'javascript' subdirectory"
      exit 1
    end

    load_headless_view_components

    generator = HeadlessViewComponent::UtilityClassesGenerator.new(catalyst_path)
    result = generator.to_yaml

    # Write to the host app's config directory
    config_dir = Rails.root.join("config")
    FileUtils.mkdir_p(config_dir)

    File.write(
      config_dir.join("headless_view_component.yml"),
      result
    )

    puts "Generated headless_view_component.yml in #{config_dir}"
  end

  desc "Install Headless View Component"
  task :install do
    Rails::Command.invoke :generate, [ "headless_view_component:install" ]
  end
end
