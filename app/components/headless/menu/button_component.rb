module Headless
  module Menu
    class ButtonComponent < ::Headless::ButtonComponent
      def initialize(**options)
        super(**options)
      end

      def before_render
        merge_options!({
          tabindex: "0",
          data: {
            headless__menu_target: "button",
            action: "headless--transition#toggle"
          },
          aria: {
            expanded: "false",
            haspopup: "menu"
          },
          onmouseover: "this.setAttribute('data-hover', '')",
          onmouseout: "this.removeAttribute('data-hover')"
        })
      end
    end
  end
end