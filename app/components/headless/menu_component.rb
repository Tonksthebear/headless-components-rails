module Headless
  class MenuComponent < ApplicationComponent
    renders_one :button, "ButtonComponent"
    renders_one :items, "ItemsComponent"

    attr_reader :open, :disabled, :anchor, :portal

    def initialize(open: false, disabled: false, anchor: {}, portal: false)
      @open = open
      @disabled = disabled
      @anchor = anchor
      @portal = portal
      super
    end

    class ButtonComponent < Headless::ButtonComponent
      def initialize(**options)
        @options = options
        @options.deep_merge!({
          tabindex: "0",
          data: {
            headless__menu_target: "button",
            action: "headless--transition#toggle"
          },
          aria: {
            expanded: "false"
          },
          onmouseover: "this.setAttribute('data-hover', '')",
          onmouseout: "this.removeAttribute('data-hover')"
        })
        super
      end
    end

    class ItemsComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownMenu"

      renders_many :items, "Headless::MenuComponent::ItemComponent"

      attr_reader :static, :unmount

      def initialize(static: false, unmount: true)
        @static = static
        @unmount = unmount
        super
      end
    end

    class ItemComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownItem"

      attr_reader :disabled

      def initialize(disabled: false)
        @disabled = disabled
        super
      end
    end

    class ShortcutComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownShortcut"

      attr_reader :disabled

      def initialize(disabled: false)
        @disabled = disabled
        super
      end
    end
  end
end
