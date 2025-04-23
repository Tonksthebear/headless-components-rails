module Headless
  module Tab
    class ListComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          role: "tablist",
          data: {
            headless__tab_target: "tabList"
          }
        })
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
