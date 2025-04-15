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
            action: "headless--transition#toggle"
            }
          })
        super
      end
    end
  end
end
