# desc "Explaining what the task does"
# task :headless_view_component do
#   # Task goes here
# end

require "yaml"
require_relative "../headless_view_component/utility_classes_generator"
require_relative "../headless_view_component/parser/jsx_parser"

namespace :headless_view_component do
  desc "Generate utility_classes.yml in the host app's config directory"
  task :generate_utility_classes, [ :catalyst_path ] do |t, args|
    # Default to the host app's root if no path is provided
    catalyst_path = args[:catalyst_path] || Rails.root.join("catalyst-ui-kit")

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

    generator = HeadlessViewComponent::UtilityClassesGenerator.new(catalyst_path)
    result = generator.to_yaml

    # Write to the host app's config directory
    config_dir = Rails.root.join("config")
    FileUtils.mkdir_p(config_dir)

    File.write(
      config_dir.join("utility_classes.yml"),
      result
    )

    puts "Generated utility_classes.yml in #{config_dir}"
  end
end
