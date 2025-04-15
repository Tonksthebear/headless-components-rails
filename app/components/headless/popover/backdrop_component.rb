module Headless
  module Popover
    class BackdropComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def call
        content_tag(@as, content, **options)
      end
    end
  end
end
