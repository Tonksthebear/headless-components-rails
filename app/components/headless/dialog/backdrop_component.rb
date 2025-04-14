module Headless
  module Dialog
    class BackdropComponent < ApplicationComponent
      def initialize(as: :div, **options)
        @as = as
        super(**options)
      end

      def before_render
        merge_options!({
          id: @options[:id],
          tabindex: "-1",
          role: @role,
          aria: {
            hidden: true
          },
          data: {
            action: "click->headless--dialog#close"
          }
        })
      end

      def call
        content_tag.public_send(@as, content, **@options)
      end
    end
  end
end

 