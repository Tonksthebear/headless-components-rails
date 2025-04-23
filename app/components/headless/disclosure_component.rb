module Headless
  class DisclosureComponent < ApplicationComponent
    renders_one :button, ->(**button_options) do
      button_options[:id] ||= "#{@options[:id]}-button"
      button_options[:default_open] = @default_open
      Headless::Disclosure::ButtonComponent.new(**button_options)
    end

    renders_one :panel, ->(**panel_options) do
      panel_options[:id] ||= "#{@options[:id]}-panel"
      panel_options[:default_open] = @default_open
      Headless::Disclosure::PanelComponent.new(id: @panel_id, **panel_options)
    end

    def initialize(as: :div, default_open: false, **options)
      @as = as
      @default_open = default_open
      options[:id] ||= "dislosure-#{object_id}"
      super(**options)
    end

    def before_render
      merge_options!({
        data: {
          controller: "headless--transition headless--disclosure",
          headless__disclosure_default_open_value: @default_open,
          headless__transition_transitioned_value: @default_open,
          transitioned_value: @default_open,
          action: "
            transition:afterenter->headless--disclosure#opened
            transition:afterleave->headless--disclosure#closed
          "
        }
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
