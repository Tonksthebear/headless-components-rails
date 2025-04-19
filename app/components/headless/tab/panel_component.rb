module Headless
  module Tab
    class PanelComponent < ApplicationComponent
      def initialize(as: :div, selected: false, **options)
        @as = as
        @selected = selected
        super(**options)
      end

      def before_render
        merge_options!({
          tabindex: "-1",
          role: "tabpanel",
          aria: {
            selected: "false"
          },
          data: {
            headless__tab_target: "panel"
          }
        })

        merge_classes!("!hidden") unless @selected
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
