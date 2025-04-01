module HeadlessViewComponent
  class UtilityClassesGenerator
    def initialize(catalyst_dir = nil)
      @catalyst_dir = catalyst_dir || File.expand_path("./catalyst-ui-kit", __dir__)
      @javascript_dir = File.join(@catalyst_dir, "javascript")
    end

    def component_mapping
      components_dir = Engine.root.join("app/components")
      component_files = Dir.glob("#{components_dir}/**/*_component.rb")

      component_files.each do |file|
        begin
          require file
        rescue StandardError => e
          puts "Warning: Could not load #{file} - #{e.message}"
        end
      end

      def find_subclasses(klass)
        subclasses = klass.subclasses
        subclasses + subclasses.flat_map { |sub| find_subclasses(sub) }
      end

      # Get all subclasses of Headless::ApplicationComponent
      headless_components = find_subclasses(::Headless::ApplicationComponent)

      # Output the results
      if headless_components.empty?
        puts "No subclasses of Headless::ApplicationComponent found."
      else
        headless_components.reject { |klass| klass.jsx_mapping[:file].nil? }.map do |klass|
          klass.jsx_mapping
        end.group_by { |mapping| mapping[:file] }
      end
    end

    def parse_javascript_file(file)
      parser = Parser::JsxTailwindParser.new

      # Construct the file path
      catalyst_file = File.join(@javascript_dir, "#{file}.jsx")
      return unless File.exist?(catalyst_file)
      parser.extract_classes_from_file(catalyst_file)
    end

    def generate_mappings
      result = { "headless" => {} }

      component_mapping.map do |file, mappings|
        parsed_classes = parse_javascript_file(file)

        mappings.each do |mapping|
          path = mapping[:view_component]
            .gsub("Headless::", "")
            .gsub("Component", "")
            .split("::")
            .map(&:downcase)

          # Only assign class_items to subcomponents (leaf nodes with path length > 1)
          if path.length > 1
            current = result["headless"]
            # Traverse up to the second-to-last part, ensuring hashes
            path[0..-2].each do |part|
              current[part] ||= {}
              current = current[part]
            end
            current[path.last] = parsed_classes.dig(mapping[:component], "classLines")
          end
        end
      end

      result
    end

    def to_yaml(data = generate_mappings, indent = 0)
      yaml = ""
      data.each do |key, value|
        if value.is_a?(Hash)
          yaml += "  " * indent + "#{key}:\n"
          yaml += to_yaml(value, indent + 1)
        elsif value.is_a?(Array)
          yaml += "  " * indent + "#{key}:\n"
          value.each do |line|
            yaml += "  " * (indent + 1) + "#{line}\n"
          end
        end
      end
      yaml
    end
  end
end
