module Headless
  module Dialog
    class PanelComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          id: options[:id],
          tabindex: "-1",
          role: @role,
          data: {
            headless__dialog_target: "panel",
            headless__transition_target: "child"
          }
        })
      end

      def call
        content_tag(as, content, **options)
      end
    end
  end
end
