module Headless
  module Combobox
    class OptionsComponent < ApplicationComponent
      def initialize(as: :div, open: false, portal_id: nil, **options)
        @as = as
        @open = open
        @portal_id = portal_id
        super(**options)
      end

      def before_render
        merge_options!({
          tabindex: "-1",
          role: "listbox",
          data: {
            controller: "headless--portal",
            headless__combobox_target: "options",
            headless__transition_target: "child",
            portal_id: @portal_id,
            hide_after_transition: ""
          }
        })

        merge_classes!("!hidden") if !@open
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
