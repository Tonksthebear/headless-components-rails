module Headless
  module Dialog
    class BackdropComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          id: @options[:id],
          tabindex: "-1",
          role: @role,
          aria: {
            hidden: true
          },
          data: {
            hide_after_transition: "",
            headless__dialog_target: "backdrop",
            headless__transition_target: "child",
            action: "click->headless--dialog#close"
          }
        })
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
