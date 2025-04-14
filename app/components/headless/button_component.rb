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
        onmouseover: "this.setAttribute('data-hover', '')",
        onmouseout: "this.removeAttribute('data-hover')"
      })
    end

    def call
      tag.button(**@options) do
        render(TouchTargetComponent.new) + content
      end
    end

    class TouchTargetComponent < ApplicationComponent
      jsx_mapping file: "button", component: "TouchTarget"

      def call
        tag.span(class: yass(skip_base: true, headless: { button: :touchtarget }), aria: { hidden: true })
      end
    end
  end
end
