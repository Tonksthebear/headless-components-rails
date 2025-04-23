module Headless
  module Popover
    class ButtonComponent < Headless::ButtonComponent
      def initialize(**options)
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            headless__popover_target: "button",
            action: "
              headless--transition#toggle
              keydown.tab->headless--popover#focusNext:prevent
              keydown.shift+tab->headless--popover#focusPrevious:prevent
            "
            }
          })
        super
      end
    end
  end
end
