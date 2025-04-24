module Headless
  class ComboboxComponent < ApplicationComponent
    # jsx_mapping file: "combobox", component: "Combobox" # Assuming this is for react-rails, may not be needed for Stimulus only
    renders_one :filter, ->(&block) do
      content_tag(:template, block.call, data: { headless__combobox_target: "filterScript" })
    end

    renders_one :input, ->(**input_options) {
      input_options[:id] ||= @options[:id] + "-input"
      Headless::Combobox::InputComponent.new(**input_options)
    }
    renders_one :button, ->(**button_options) {
      button_options[:id] ||= @options[:id] + "-button"
      Headless::Combobox::ButtonComponent.new(**button_options)
    }
    renders_one :options_container, ->(**options_container_options) {
      options_container_options[:id] ||= @options[:id] + "-options-container"
      options_container_options[:portal_id] = @options[:id] + "-portal"
      options_container_options[:open] = @open
      Headless::Combobox::OptionsComponent.new(**options_container_options)
    }
    renders_many :options, ->(**option_options) {
      option_options[:id] ||= @options[:id] + "-option-#{@nil_option_count += 1}"
      Headless::Combobox::OptionComponent.new(**option_options)
    }

    def initialize(as: :div, open: false, default_value: [], nullable: true, immediate: false, virtual: false, **options)
      @as = as
      @open = open
      @default_value = default_value
      @nullable = nullable
      @immediate = immediate
      @virtual = virtual
      @multiple = options[:multiple]
      @nil_option_count = 0
      @nil_options = []
      options[:id] ||= "combobox-#{object_id}"
      super(**options)
    end

    def before_render
      if options.select(&:has_no_value?).count > 1
        raise "Only one nil option is allowed, but #{options.select(&:has_no_value?).count} were provided"
      end

      merge_options!({
        data: {
          controller: "headless--transition headless--combobox",
          headless__combobox_headless__portal_outlet: "[data-portal-id='#{@options[:id]}-portal']",
          headless__combobox_headless__transition_outlet: "##{@options[:id]}",
          headless__transition_headless__portal_outlet: "[data-portal-id='#{@options[:id]}-portal']",
          headless__combobox_value_value: @default_value.to_json,
          headless__combobox_default_value_value: @default_value.to_json,
          headless__combobox_multiple_value: @multiple,
          headless__combobox_disabled_value: @disabled,
          headless__combobox_nullable_value: @nullable,
          headless__combobox_immediate_value: @immediate,
          headless__combobox_virtual_value: @virtual,
          action: "
            keydown.enter->headless--combobox#selectActiveOption:prevent
            keydown.down->headless--combobox#focusNextOption:prevent
            keydown.up->headless--combobox#focusPreviousOption:prevent
            keydown.home->headless--combobox#focusFirstOption:prevent
            keydown.page_up->headless--combobox#focusFirstOption:prevent
            keydown.end->headless--combobox#focusLastOption:prevent
            keydown.page_down->headless--combobox#focusLastOption:prevent
            keydown.esc->headless--combobox#clearInput:prevent
            keydown.esc->headless--combobox#close:prevent
            click@document->headless--combobox#checkOutside
          "
        }
      })
      # merge_classes!("contents") if @as == :div && options[:class].blank?
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
