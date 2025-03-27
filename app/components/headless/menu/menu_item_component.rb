module Headless
  module Menu
    class MenuItemComponent < ApplicationComponent
      attr_reader :disabled

      def initialize(disabled: false)
        @disabled = disabled
        super
      end
    end
  end
end
