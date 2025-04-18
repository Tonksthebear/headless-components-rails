module Headless
  module Popover
    class BackdropComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          aria: {
            hidden: true
          },
          data: {
            hide_after_transition: "",
            headless__popover_target: "backdrop",
            headless__transition_target: "child",
            action: "click->headless--transition#leave"
          }
        })
      end

      def call
        content_tag(@as, content, **options)
      end
    end
  end
end
