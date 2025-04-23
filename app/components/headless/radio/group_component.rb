# frozen_string_literal: true

module Headless
  module Radio
    class GroupComponent < ApplicationComponent
      attr_reader :id

      renders_many :radios, ->(value, **radio_options) do
        RadioComponent.new(@name, value, **radio_options)
      end

      def initialize(as: :div, **options)
        @as = as
        @id = options[:id]
        @name = options[:name] || "radio-group-#{object_id}"
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
          role: "radiogroup",
          aria: {
            disabled: @options[:disabled] || nil
          },
          data: {
            controller: "headless--radio-group",
            disabled: @options[:disabled] || nil,
            invalid: @options[:invalid] || nil,
            focus: @options[:focus] || nil,
            autofocus: @options[:autofocus] || nil,
            action: "
              keydown.down->headless--radio-group#selectNextRadio:prevent
              keydown.up->headless--radio-group#selectPreviousRadio:prevent
              keydown.right->headless--radio-group#selectNextRadio:prevent
              keydown.left->headless--radio-group#selectPreviousRadio:prevent
              keydown.enter->headless--radio-group#enter:prevent
              keydown.space->headless--radio-group#selectOption:prevent
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
