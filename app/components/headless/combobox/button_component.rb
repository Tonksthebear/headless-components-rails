module Headless
  module Combobox
    class ButtonComponent < Headless::ButtonComponent
      def initialize(as: :button, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          tabindex: "-1",
          aria: {
            haspopup: "listbox",
            expanded: "false"
          },
          data: {
            headless__combobox_target: "button",
            action: "
              click->headless--transition#toggle
            "
          }
        })
        super
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
