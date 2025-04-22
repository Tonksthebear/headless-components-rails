# frozen_string_literal: true

module Headless
  class ButtonComponent < ApplicationComponent
    jsx_mapping file: "button", component: "Button"
    renders_one :icon, ->(icon:, variant: "micro", **options) do
      heroicon icon, variant: variant, data: { slot: "icon" }, **options
    end

    def initialize(color: :light, style: :solid, **options)
      @color = color
      @style = style
      super(**options)
    end

    def before_render
      merge_classes!(yass(headless: { button: [ @color, @style ] }))

      merge_options!({
        onmouseenter: "this.setAttribute('data-hover', '')",
        onmouseleave: "this.removeAttribute('data-hover'); this.removeAttribute('data-active')",
        onmousedown: "this.setAttribute('data-active', '')",
        onmouseup: "this.removeAttribute('data-active')",
        onfocus: "Headless.elementFocus(this)",
        onblur: "Headless.elementBlur(this)"
      })
    end

    def call
      tag.button(**@options) do
        TouchTargetComponent.new
        content
      end
    end

    class TouchTargetComponent < ApplicationComponent
      jsx_mapping file: "button", component: "TouchTarget"

      def render?
        classes.present?
      end

      def classes
        yass(skip_base: true, headless: { button: :touchtarget })
      end

      def call
        tag.span(class: classes, aria: { hidden: true })
      end
    end
  end
end
