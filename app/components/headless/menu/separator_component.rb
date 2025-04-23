module Headless
  module Menu
    # Renders a visual and semantic separator between menu items or sections.
    class SeparatorComponent < ApplicationComponent
      def initialize(**options)
        super(**options)
      end

      def before_render
        merge_classes!(yass(headless: { menu: { separator: :classes } }))
        merge_options!({ role: "separator", aria: { hidden: "true" } })
      end

      def call
        tag.div(**options)
      end
    end
  end
end
