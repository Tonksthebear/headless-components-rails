module Headless
  module Menu
    class MenuButtonComponent < ApplicationComponent
      attr_reader :disabled, :auto_focus

      def initialize(disabled: false, auto_focus: false)
        @disabled = disabled
        @auto_focus = auto_focus
        super
      end
    end
  end
end
