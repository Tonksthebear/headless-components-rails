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

    def self.generate(catalyst_dir = nil)
      new(catalyst_dir).generate
    end

    def initialize(catalyst_dir = nil)
      @catalyst_dir = catalyst_dir || File.expand_path("./catalyst-ui-kit", __dir__)
      @javascript_dir = File.join(@catalyst_dir, "javascript")
    end

    def generate
      result = { "headless" => {} }

      COMPONENT_MAPPING.each do |headless_component, catalyst_info|
        catalyst_file = File.join(@javascript_dir, "#{catalyst_info[:file]}.jsx")
        next unless File.exist?(catalyst_file)

        content = File.read(catalyst_file)
        class_items = extract_class_items(content, catalyst_info[:component])
        next if class_items.empty?

        # Transform component name into nested structure
        path = headless_component
          .gsub("Headless::", "")
          .gsub("Component", "")
          .split("::")
          .map(&:downcase)

        # Build nested hash
        current = result["headless"]
        path.each_with_index do |part, index|
          if index == path.length - 1
            # Check for existing hash to prevent TypeError if a parent was already assigned classes
            if current.key?(part) && !current[part].is_a?(Hash)
              puts "Warning: Overwriting existing classes for parent component '#{path[0...index].join('.')}' to add child '#{part}'. Consider refining the mapping."
            end
            current[part] = class_items
          else
            # Ensure node exists and is a Hash for nesting
            current[part] = {} unless current.key?(part) && current[part].is_a?(Hash)
            current = current[part]
          end
        end
      end

      result
    end

    private

    def extract_class_items(content, component_name)
      # Find the component definition
      component_pattern = /export function #{component_name}[^{]*{(.*)}/m
      component_match = content.match(component_pattern)
      return [] unless component_match && component_match[1]

      component_content = component_match[1]
      # puts "Processing component content for #{component_name}:"
      # puts component_content

      # Extract content inside className={...}
      class_name_pattern = /\s*className\s*=\s*{([^}]+)}/m
      matches = component_content.match(class_name_pattern)
      # puts "Found className matches: #{matches.inspect}"
      return [] unless matches && matches[1]

      content_inside_braces = matches[1]
      lines = content_inside_braces.split("\n")

      items = []
      comment_regex = %r{^\s*//(.*)$} # Match comment lines
      string_regex = /^\s*['"]([^'"]+)['"],?\s*$/ # Match 'string', "string", 'string',, "string",

      lines.each do |line|
        comment_match = line.match(comment_regex)
        string_match = line.match(string_regex)

        if comment_match
          # Store comment with a marker to distinguish it later
          items << { type: :comment, value: comment_match[1].strip }
        elsif string_match
          # Store the actual class string
          items << { type: :class, value: string_match[1].strip }
        end
        # Ignore lines that are neither comments nor valid strings (like clsx(, ), etc.)
      end

      items # Return array of hashes {type: :comment/:class, value: ...}
    end
  end
end
