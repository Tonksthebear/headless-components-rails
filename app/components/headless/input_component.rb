# frozen_string_literal: true

module Headless
  class InputComponent < ApplicationComponent
    def initialize(**options)
      super(**options)
    end

    def before_render
      merge_options!({
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
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] || nil,
          focus: @options[:focus] || nil,
          autofocus: @options[:autofocus] || nil
        }
      })
    end

    def call
      tag.input(**@options)
    end
  end
end
