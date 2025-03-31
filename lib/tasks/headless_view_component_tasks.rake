# desc "Explaining what the task does"
# task :headless_view_component do
#   # Task goes here
# end

require "yaml"
require_relative "../headless_view_component/utility_classes_generator"

namespace :headless_view_component do
  # Custom YAML generation function
  def generate_yaml(data, indent = 0)
    yaml_string = ""
    indent_space = "  " * indent

    data.each do |key, value|
      yaml_string << "#{indent_space}#{key}:\n"
      if value.is_a?(Hash)
        yaml_string << generate_yaml(value, indent + 1)
      elsif value.is_a?(Array)
        value.each do |item|
          if item.is_a?(Hash) && item[:type] == :comment
            # Format comment lines
            yaml_string << "#{indent_space}  # #{item[:value]}\n"
          elsif item.is_a?(Hash) && item[:type] == :class
            # Format class lines as YAML list items
            yaml_string << "#{indent_space}  - \"#{item[:value]}\"\n" # Ensure strings are quoted
          else
            # Fallback for unexpected array items (shouldn't happen with current logic)
            yaml_string << "#{indent_space}  - #{item.inspect}\n"
          end
        end
      end
    end
    yaml_string
  end

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
    result = generator.generate

    # Write to the host app's config directory
    config_dir = Rails.root.join("config")
    FileUtils.mkdir_p(config_dir)

    # Generate YAML using the custom function
    yaml_output = generate_yaml(result)

    File.write(
      config_dir.join("utility_classes.yml"),
      yaml_output
    )

    puts "Generated utility_classes.yml in #{config_dir}"
  end
end
