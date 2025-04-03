require "mini_racer"

module HeadlessViewComponent
  module Parser
    class JsxTailwindParser
      def initialize
        @root = HeadlessViewComponent::Engine.root
        @context = MiniRacer::Context.new
        load_dependencies
        load_default_parsers
        load_component_parsers
      end

      def load_dependencies
        @context.load(@root.join("lib/headless_view_component/parser/src/babel.min.js")) # Contains extractTailwindClasses()
        @context.load(@root.join("lib/headless_view_component/parser/src/helpers.js")) # Contains getParentObject()
      end

      def load_default_parsers
        @context.load(@root.join("lib/headless_view_component/parser/src/default_parser.js")) # Contains defaultParser()
        @context.load(@root.join("lib/headless_view_component/parser/src/parser.js")) # Contains extractTailwindClasses()
      end

      def load_component_parsers
        Headless::ApplicationComponent.subclasses.each do |view_component|
          view_component.sidecar_files([ "parser.js" ]).each do |parser|
            @context.load(parser)
          end
        end
      end

      def extract_classes_from_file(path, options = {})
        jsx_content = File.read(path)
        @context.attach("console.log", proc { |*args| puts args.join(" ") })
        @context.call("extractTailwindClasses", jsx_content, options)
      end
    end
  end
end
