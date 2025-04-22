module Headless
  module Listbox
    class ButtonComponent < Headless::ButtonComponent
      renders_one :icon, ->(icon_name, **icon_options) {
        icon_options[:variant] ||= "micro"

        heroicon icon_name, **icon_options
      }

      def initialize(as: :button, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          role: "button"
        })
        super
      end
    end
  end
end
