module Headless
  module Disclosure
    class PanelComponent < ApplicationComponent
      renders_one :close_button, ->(**button_options) do
        button_options[:data] ||= {}
        button_options[:data][:action] = "headless--transition#leave"
        Headless::ButtonComponent.new(**button_options)
      end

      def initialize(as: :div, default_open: false, **options)
        @as = as
        @default_open = default_open
        super(**options)
      end

      def before_render
        merge_options!({
          data: {
            headless__disclosure_target: "panel",
            headless__transition_target: "child",
            hide_after_transition: ""
          }
        })
        merge_classes!("!hidden") unless @default_open
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
