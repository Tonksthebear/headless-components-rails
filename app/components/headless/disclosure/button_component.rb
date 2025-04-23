module Headless
  module Disclosure
    class ButtonComponent < ::Headless::ButtonComponent
      def initialize(default_open: false, **options)
        @default_open = default_open
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            open: @default_open ? "true" : nil,
            headless__disclosure_target: "button",
            action: "
              click->headless--transition#toggle
            "
          }
        })
        super
      end
    end
  end
end
