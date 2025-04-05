module HeadlessViewComponent
  class UtilityClassesGenerator
    def initialize(catalyst_dir = nil)
      @catalyst_dir = catalyst_dir || File.expand_path("./catalyst-ui-kit", __dir__)
      @javascript_dir = File.join(@catalyst_dir, "javascript")
    end

    def component_mapping
      headless_components = Headless::ApplicationComponent.subclasses

      if headless_components.empty?
        puts "No subclasses of Headless::ApplicationComponent found."
      else
        headless_components.map do |klass|
          component_name = klass.name.gsub("Component", "")
          component_name = component_name.gsub("::", "")
          component_name = component_name.gsub("Headless", "")
          hash = klass.jsx_mapping
          hash[:parser_function] = "parse" + component_name if klass.sidecar_files([ "parser.js" ]).any?
          hash
        end.group_by { |mapping| mapping[:file] }
      end
    end

    def parse_javascript_file(file, mappings)
      parser = Parser::JsxTailwindParser.new
      parsers = []
      mappings.each do |mapping|
        parsers << { component: mapping[:component], parser_function: mapping[:parser_function], view_component: mapping[:view_component] }
      end

      # Construct the file path
      catalyst_file = File.join(@javascript_dir, "#{file}.jsx")
      return unless File.exist?(catalyst_file)
      parser.extract_classes_from_file(catalyst_file, { component_parsers: parsers })
    end

    def generate_mappings
      result = {}

      component_mapping.map do |file, mappings|
        parsed_classes = parse_javascript_file(file, mappings)

        mappings.each do |mapping|
          path = mapping[:view_component]
            .gsub("Headless::", "")
            .gsub("Component", "")
            .split("::")
            .map(&:downcase)


          def set_nested(hash, keys, value)
            current = hash
            if keys.length > 1
              keys[0..-2].each do |key|
                current[key] ||= {}
                current = current[key]
              end
              current[keys.last] = value
            elsif value
              if value.is_a?(Hash)
                if current[keys.last].present?
                  current[keys.last] = current[keys.last].merge(value)
                else
                  current[keys.last] = value
                end
              else
                current[keys.last] = value
              end
            end
          end

          set_nested(result, path, parsed_classes&.dig(mapping[:component]))
        end
      end

      { "headless" => result }
    end

    def to_yaml(data = generate_mappings, indent = 0)
      yaml = ""
      data.each do |key, value|
        if value.is_a?(Hash)
          yaml += "  " * indent + "#{key}:\n"
          yaml += to_yaml(value, indent + 1)
        elsif value.is_a?(Array) && value.present?
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
