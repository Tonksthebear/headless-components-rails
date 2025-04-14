module Headless
  module Menu
    class ItemComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownItem"

      attr_reader :type, :disabled, :block

      def initialize(type: :button, **options, &block)
        @type = type
        @block = block
        super(**options)
      end

      def before_render
        merge_classes!(yass(headless: { menu: { item: :classes } }))
        merge_options!({
          tabindex: -1,
          data: {
            headless__menu_target: "item",
            action: "
              mouseover->headless--menu#focus
              click->headless--menu#select
              mouseleave->headless--menu#blur
              focus->headless--menu#focus
              blur->headless--menu#blur
            "
          }
        })
      end

      def call
        tag.public_send(type, **options) do
          content
        end
      end
    end
  end
end