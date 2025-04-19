module Headless
  module Tab
    class PanelsComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          role: "tabpanels",
          data: {
            headless__tab_target: "panels"
          }
        })
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
