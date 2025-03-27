module Headless
  class MenuComponent < ApplicationComponent
    renders_one :button, Headless::Menu::ButtonComponent
    renders_many :items, Headless::Menu::ItemComponent

    attr_reader :open, :disabled

    def initialize(open: false, disabled: false)
      @open = open
      @disabled = disabled
      super
    end
  end
end
