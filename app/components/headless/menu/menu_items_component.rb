module Headless
  module Menu
    class MenuItemsComponent < ApplicationComponent
      attr_reader :static, :unmount

      def initialize(static: false, unmount: true)
        @static = static
        @unmount = unmount
        super
      end
    end
  end
end
