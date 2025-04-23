module Headless
  module Menu
    class ButtonComponent < Headless::ButtonComponent
      def initialize(**options)
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            headless__menu_target: "button",
            action: "
              click->headless--transition#toggle
            "
          },
          aria: {
            expanded: "false",
            haspopup: "menu"
          }
        })
        super
      end
    end
  end
end
