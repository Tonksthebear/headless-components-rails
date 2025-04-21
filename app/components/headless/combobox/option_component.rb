module Headless
  module Combobox
    class OptionComponent < ApplicationComponent
      attr_reader :value, :disabled

      def initialize(as: :div, value: nil, display_value: value, disabled: false, **options)
        @as = as
        @value = value || display_value
        @display_value = display_value
        @disabled = disabled
        super(**options)
      end

      def has_no_value?
        @value.blank?
      end

      def before_render
        merge_options!({
          role: "option",
          tabindex: "-1",
          aria: {
            disabled: @disabled
          },
          data: {
            value: @value.to_json,
            display_value: @display_value.to_s,
            headless__combobox_target: "option",
            action: "
              click->headless--combobox#selectOption
              mouseover->headless--combobox#focusOption
              mouseout->headless--combobox#unfocusOption
            "
          }
        })
      end

      def call
        if has_no_value?
          content_tag(:template, content_tag(@as, content, **@options), data: { headless__combobox_target: "templateOption" })
        else
          content_tag(@as, content, **@options)
        end
      end
    end
  end
end
