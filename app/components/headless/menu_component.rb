module Headless
  class MenuComponent < ApplicationComponent
    attr_reader :open, :disabled, :anchor, :portal
    renders_one :button, ->(**button_options) do
      button_options[:aria] ||= {}
      button_options[:aria][:controls] = @menu_id
      button_options[:aria][:haspopup] = "menu"
      Headless::Menu::ButtonComponent.new(**button_options)
    end
    renders_one :items, ->(**items_options) do
      Headless::Menu::ItemsComponent.new(items_id: @menu_id, **items_options)
    end

    def initialize(open: false, disabled: false, anchor: "", portal: false, **options)
      options[:id] = options[:id] || "menu-#{object_id}"
      @menu_id = options[:id]
      @open = open
      @disabled = disabled
      @anchor = anchor
      @portal = portal
      options[:class] ||= "contents"
      super(**options)
    end

    def before_render
      merge_options!({
        data: {
          controller: "headless--transition headless--menu",
          headless__menu_open_at_start_value: @open,
          headless__menu_portal_value: @portal,
          headless__menu_anchor_to_value: @anchor,
          headless__menu_headless__portal_outlet: "[data-headless-portal-id='#{@menu_id}']",
          headless__menu_headless__transition_outlet: "##{@menu_id}",
          headless__transition_headless__portal_outlet: "[data-headless-portal-id='#{@menu_id}']",
          action: "
            click@document->headless--menu#closeOnClickOutside
            transition:beforeenter->headless--menu#sendPortal
            transition:afterenter->headless--menu#menuOpened
            transition:afterleave->headless--menu#menuClosed
            headless--menu:leave->headless--transition#leave
            transition:afterleave->headless--menu#retrievePortal
          "
        }
      })
    end

    def call
      content_tag(:div, content, **@options)
    end
  end
end
