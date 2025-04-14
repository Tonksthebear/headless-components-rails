module Headless
  module Dialog
    class BackdropComponent < ApplicationComponent
      DEFAULT_TAG = :div

      attr_reader :tag

      def initialize(tag: DEFAULT_TAG, **options)
        @tag = tag
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
        tag.public_send(@tag, **@options) do
          content
        end
      end
    end
  end
end

 