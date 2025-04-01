require "mini_racer"

module HeadlessViewComponent
  module Parser
    class JsxTailwindParser
      def initialize
        root = HeadlessViewComponent::Engine.root
        @context = MiniRacer::Context.new
        @context.eval(File.read(root.join("lib/headless_view_component/parser/dist/bundle.js"))) # Contains extractTailwindClasses()
      end

      def extract_classes_from_file(path)
        jsx_content = File.read(path)
        @context.call("extractTailwindClasses", jsx_content)
      end
    end
  end
end
