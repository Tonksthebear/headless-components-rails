module Headless
  module Popover
    class PanelComponent < ApplicationComponent
      def initialize(as: :div, portal_id:, **options)
        @as = as
        @portal_id = portal_id
        super(**options)
      end

      def before_render
        merge_options!({ 
          id: @id, 
          data: { 
            controller: "headless--portal",
            headless__popover_target: "panel" ,
            headless__transition_target: "child",
            portal_id: @portal_id,
            hide_after_transition: ""
          }
        })
        merge_classes!("!hidden")
      end

      def call
        content_tag(@as, content, **options)
      end
    end
  end
end
