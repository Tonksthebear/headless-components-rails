module Headless
  class PopoverComponent < ApplicationComponent
    renders_one :button, -> (**button_options) do
      button_options[:id] ||= options[:id] + "-button"
      Headless::Popover::ButtonComponent.new(**button_options)
    end

    renders_one :panel, -> (**panel_options) do
      panel_options[:id] ||= options[:id] + "-panel"
      panel_options[:portal_id] ||= options[:id] + "-portal"
      Headless::Popover::PanelComponent.new(**panel_options)
    end

    def initialize(as: :div, open: false, **options)
      @as = as
      @open = open
      options[:id] ||= "popover-#{object_id}"
      super(**options)
    end

    def before_render
      merge_options!({ 
        data: { 
          controller: "headless--transition headless--popover",
          headless__popover_open_at_start_value: @open,
          headless__popover_headless__portal_outlet: "[data-portal-id='#{options[:id]}-portal']",
          headless__transition_headless__portal_outlet: "[data-portal-id='#{options[:id]}-portal']",
          headless__popover_headless__transition_outlet: "##{options[:id]}",
          action: "
            click@document->headless--popover#closeOnClickOutside
            keydown.esc@document->headless--popover#closeOnEscape
            transition:beforeenter->headless--popover#sendPortal
            transition:afterenter->headless--popover#popoverOpened
            transition:afterleave->headless--popover#popoverClosed
            headless--popover:leave->headless--transition#leave
            transition:afterleave->headless--popover#retrievePortal
          "
        }
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end