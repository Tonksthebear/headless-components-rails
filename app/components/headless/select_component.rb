# frozen_string_literal: true

module Headless
  class SelectComponent < ApplicationComponent
    attr_reader :id

    def initialize(**options)
      @id = options[:id]
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
          invalid: @options[:invalid] ? "" : nil
        },
        data: {
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] ? "" : nil,
          autofocus: @options[:autofocus] ? "" : nil
        }
      })
    end

    def call
      tag.select(**@options) do
        content
      end
    end
  end
end
