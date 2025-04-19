module Headless
  module Combobox
    class InputComponent < ApplicationComponent
      def initialize(as: :input, **options)
        @as = as
        super(**options)
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
