module Headless
  class MenuComponent < ApplicationComponent
    attr_reader :open, :disabled, :anchor, :portal
    renders_one :button, Headless::Menu::ButtonComponent
    renders_one :items, Headless::Menu::ItemsComponent

    def initialize(open: false, disabled: false, anchor: {}, portal: false, **options)
      @open = open
      @disabled = disabled
      @anchor = anchor
      @portal = portal
      super(**options)
    end
  end
end
