module Headless
  module Menu
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
