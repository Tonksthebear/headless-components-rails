module Headless
  module Listbox
    class OptionComponent < ApplicationComponent
      attr_reader :value, :disabled

      def initialize(as: :div, value: nil, disabled: false, **options)
        @as = as
        @value = value
        @disabled = disabled
        super(**options)
      end

      def before_render
        merge_options!({
          role: "option",
          tabindex: @disabled ? nil : "-1",
          "aria-disabled": @disabled,
          "aria-selected": "false",
          data: {
            headless__listbox_target: "option",
            headless__listbox_value: @value,
            headless__listbox_disabled: @disabled,
            action: "
              click->headless--listbox#selectOption
              mouseenter->headless--listbox#focusOption
              mouseleave->headless--listbox#blurOption
            "
          }
        })
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
