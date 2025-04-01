module HeadlessViewComponent
  class UtilityClassesGenerator
    COMPONENT_MAPPING = {
      "Headless::MenuComponent" => { file: "dropdown", component: "DropdownMenu" },
      "Headless::MenuComponent::ButtonComponent" => { file: "dropdown", component: "DropdownButton" },
      "Headless::MenuComponent::ItemsComponent" => { file: "dropdown", component: "DropdownMenu" },
      "Headless::MenuComponent::ItemComponent" => { file: "dropdown", component: "DropdownItem" },
      "Headless::MenuComponent::SectionComponent" => { file: "dropdown", component: "DropdownSection" },
      "Headless::MenuComponent::HeadingComponent" => { file: "dropdown", component: "DropdownHeading" },
      "Headless::MenuComponent::SeparatorComponent" => { file: "dropdown", component: "DropdownDivider" },
      "Headless::MenuComponent::LabelComponent" => { file: "dropdown", component: "DropdownLabel" },
      "Headless::MenuComponent::DescriptionComponent" => { file: "dropdown", component: "DropdownDescription" },
      "Headless::MenuComponent::ShortcutComponent" => { file: "dropdown", component: "DropdownShortcut" },
      "Headless::MenuComponent::HeaderComponent" => { file: "dropdown", component: "DropdownHeader" }
    }.freeze

    # def self.generate(catalyst_dir = nil)
    # new(catalyst_dir).generate
    # end

    def initialize(catalyst_dir = nil)
      @catalyst_dir = catalyst_dir || File.expand_path("./catalyst-ui-kit", __dir__)
      @javascript_dir = File.join(@catalyst_dir, "javascript")
    end

    def parse_javascript_file
      parser = Parser::JsxTailwindParser.new

      COMPONENT_MAPPING.each do |headless_component, catalyst_info|
        # Construct the file path
        catalyst_file = File.join(@javascript_dir, "#{catalyst_info[:file]}.jsx")
        next unless File.exist?(catalyst_file)
        classes = parser.extract_classes_from_file(catalyst_file)
        # binding.irb
        exit
      end
    end

    def generate
      result = { "headless" => {} }

      COMPONENT_MAPPING.each do |headless_component, catalyst_info|
        # Construct the file path
        catalyst_file = File.join(@javascript_dir, "#{catalyst_info[:file]}.jsx")
        next unless File.exist?(catalyst_file)

        # Read the file content
        content = File.read(catalyst_file)
        class_items = extract_class_items(content, catalyst_info[:component])
        next if class_items.empty?

        # Parse the component path (e.g., "MenuComponent::ItemComponent" -> ["menu", "item"])
        path = headless_component
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
          # Assign class_items to the leaf
          current[path.last] = class_items
        end
      end

      result
    end

    def to_yaml(data = generate, indent = 0)
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

    private

    def extract_class_items(content, component_name)
      # Match the component function definition
      component_pattern = /export function #{component_name}\s*\([^)]*\)\s*\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}/m
      component_match = content.match(component_pattern)
      return [] unless component_match && component_match[1]

      component_content = component_match[1]
      # Look for className or classes definition
      class_name_pattern = /className\s*=\s*\{([\s\S]*?)\}/
      classes_pattern = /let\s+classes\s*=\s*clsx\(([\s\S]*?)\);/
      clsx_pattern = /clsx\(((?:[^()]+|\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\))*?)\)/


      # match = component_content.match(class_name_pattern) || component_content.match(classes_pattern)
      match = component_content.match(clsx_pattern)
      return [] unless match && match[1]

      content_inside = match[1]

      # Parse the class strings and comments
      lines = content_inside.split("\n")
      items = []

      # Regex for comments and class strings
      comment_regex = /^\s*\/\/(.*)$/
      string_regex = /'([^']*)'|"([^"]*)"/

      lines.each do |line|
        line = line.strip
        if comment_match = line.match(comment_regex)
          items << "# #{comment_match[1].strip}"
        elsif string_match = line.match(string_regex)
          items << %(- "#{string_match[1].strip}")
        end
        # Ignore other lines (e.g., variables like className)
      end
      items
    end
  end
end
