module Headless
  module Listbox
    class SelectedOptionComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
