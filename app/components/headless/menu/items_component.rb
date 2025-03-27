module Headless
  module Menu
    class ItemsComponent < ApplicationComponent
      renders_many :items, Headless::Menu::ItemComponent

      attr_reader :static, :unmount

      def initialize(static: false, unmount: true)
        @static = static
        @unmount = unmount
        super
      end
    end
  end
end
