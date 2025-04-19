module Headless
  module Combobox
    class ButtonComponent < Headless::ButtonComponent
      def initialize(as: :button, **options)
        @as = as
        super(**options)
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
