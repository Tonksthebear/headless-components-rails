module Headless
  module Dialog
    class BackButtonComponent < ButtonComponent
      def initialize(**options)
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            action: "headless--transition#leave"
          }
        })
        super
      end
    end
  end
end
