module Headless
  class MenuComponent < ApplicationComponent
    attr_reader :open, :disabled, :anchor, :portal
    renders_one :button, "Headless::MenuComponent::ButtonComponent"
    renders_one :items, Headless::Menu::ItemsComponent

    def initialize(open: false, disabled: false, anchor: {}, portal: false, **options)
      @open = open
      @disabled = disabled
      @anchor = anchor
      @portal = portal
      super(**options)
    end

    class ButtonComponent < Headless::ButtonComponent
      def initialize(**options)
        options.deep_merge!({
          tabindex: "0",
          data: {
            headless__menu_target: "button",
            action: "headless--transition#toggle"
          },
          aria: {
            expanded: "false",
            haspopup: "menu"
          },
          onmouseover: "this.setAttribute('data-hover', '')",
          onmouseout: "this.removeAttribute('data-hover')"
        })
        super(**options)
      end
    end

    class ShortcutComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownShortcut"

      attr_reader :disabled

      def initialize(disabled: false, **options)
        @disabled = disabled
        super(**options)
      end
    end
  end
end
