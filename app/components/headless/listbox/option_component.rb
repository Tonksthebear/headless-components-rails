module Headless
  module Listbox
    class OptionComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
