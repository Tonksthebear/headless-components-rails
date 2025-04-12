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

    def merged_options
      @options.deep_merge!({
        onmouseover: "this.setAttribute('data-hover', '')",
        onmouseout: "this.removeAttribute('data-hover')"
      })

      @options
    end

    def classes
      merge_classes!(yass(headless: { button: [ @color, @style ] }))
    end

    def render_icon
      if icon.present?
        icon.to_s
      end
    end

    def call
      tag.button(**merged_options) do
        render(TouchTargetComponent.new) + content + render_icon
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
