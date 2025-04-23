module Headless
  module Listbox
    class SelectedOptionComponent < ApplicationComponent
      attr_reader :placeholder

      def initialize(as: :div, placeholder: nil, **options)
        @as = as
        @placeholder = placeholder
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            headless__listbox_target: "selectedOption"
          }
        })
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
