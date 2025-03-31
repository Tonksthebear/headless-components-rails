module Headless
  class MenuComponent < ApplicationComponent
    renders_one :button, "ButtonComponent"
    renders_one :items, "ItemsComponent"

    attr_reader :open, :disabled

    def initialize(open: false, disabled: false)
      @open = open
      @disabled = disabled
      super
    end

    class ButtonComponent < ApplicationComponent
      attr_reader :disabled, :auto_focus

      def initialize(disabled: false, auto_focus: false)
        @disabled = disabled
        @auto_focus = auto_focus
        super
      end
    end

    class ItemsComponent < ApplicationComponent
      renders_many :items, "Headless::MenuComponent::ItemComponent"

      attr_reader :static, :unmount

      def initialize(static: false, unmount: true)
        @static = static
        @unmount = unmount
        super
      end
    end

    class ItemComponent < ApplicationComponent
      attr_reader :disabled

      def initialize(disabled: false)
        @disabled = disabled
        super
      end
    end
  end
end
