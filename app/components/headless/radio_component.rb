# frozen_string_literal: true

module Headless
  class RadioComponent < ApplicationComponent
    def initialize(name, value, **options)
      @name = name
      @value = value
      super(**options)
    end

    def radio_options
      {
        disabled: @options[:disabled] || nil
      }
    end

    def before_render
      merge_options!({
        tabindex: -1,
        onfocus: "Headless.elementFocus(this)",
        onblur: "Headless.elementBlur(this)",
        onmouseenter: "Headless.elementHover(this)",
        onmouseleave: "Headless.elementLeave(this)",
        onmousedown: "Headless.elementMouseDown(this)",
        onmouseup: "Headless.elementMouseUp(this)",
        aria: {
          disabled: @options[:disabled] || nil
        },
        data: {
          headless__radio_group_target: "radio",
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] || nil,
          focus: @options[:focus] || nil,
          autofocus: @options[:autofocus] || nil,
          action: "click->headless--radio-group#radioClicked"
        }
      })
    end

    def call
      tag.div(**@options) do
        radio_button_tag(@name, @value, class: "sr-only", **radio_options) + content
      end
    end
  end
end
