module Headless
  class ListboxComponent < ApplicationComponent
    attr_reader :open, :disabled, :anchor, :portal, :multiple, :value, :default_value, :name, :form

    renders_one :button, ->(**button_options) do
      button_options[:id] ||= "#{@listbox_id}-button"
      button_options[:keyboard_navigation_actions] = keyboard_navigation_actions
      Headless::Listbox::ButtonComponent.new(**button_options)
    end

    renders_one :options_container, ->(**options_container_options) do
      options_container_options[:id] ||= @listbox_id + "-options"
      options_container_options[:horizontal] = @horizontal
      options_container_options[:keyboard_navigation_actions] = keyboard_navigation_actions
      Headless::Listbox::OptionsComponent.new(listbox_id: @listbox_id, **options_container_options)
    end

    renders_many :options, ->(**options_options) do
      index = options.length
      options_options[:id] ||= "#{@listbox_id}-option-#{index}"
      Headless::Listbox::OptionComponent.new(**options_options)
    end

    renders_one :selected_option, ->(**selected_option_options) do
      Headless::Listbox::SelectedOptionComponent.new(**selected_option_options)
    end

    def initialize(open: false, horizontal: false, anchor: {}, portal: false, multiple: false, value: nil, default_value: nil, name: nil, form: nil, **options)
      options[:id] = options[:id] || "listbox-#{object_id}"
      @listbox_id = options[:id]
      @open = open
      @horizontal = horizontal
      @anchor = anchor
      @portal = portal
      @multiple = multiple
      @value = value
      @default_value = default_value
      @name = name
      @form = form
      options[:class] ||= "contents"
      super(**options)
    end

    def keyboard_navigation_actions
      actions = []
      if @horizontal
        actions << "keydown.right->headless--listbox#focusNextOption:prevent"
        actions << "keydown.left->headless--listbox#focusPreviousOption:prevent"
      else
        actions << "keydown.down->headless--listbox#focusNextOption:prevent"
        actions << "keydown.up->headless--listbox#focusPreviousOption:prevent"
      end
      actions
    end

    def before_render
      merge_options!({
        role: "listbox",
        data: {
          controller: "headless--transition headless--listbox",
          headless__listbox_open_at_start_value: @open,
          headless__listbox_portal_value: @portal,
          headless__listbox_anchor_to_value: @anchor[:to],
          headless__listbox_multiple_value: @multiple,
          headless__listbox_value_value: @value,
          headless__listbox_default_value_value: @options[:default_value],
          headless__listbox_name_value: @name,
          headless__listbox_form_value: @form,
          headless__listbox_headless__portal_outlet: "[data-headless-portal-id='#{@listbox_id}-portal']",
          headless__listbox_headless__transition_outlet: "##{@listbox_id}",
          headless__transition_headless__portal_outlet: "[data-headless-portal-id='#{@listbox_id}-portal']",
          actions: "
            headless--listbox:leave->headless--transition#leave
          "
        }
      })
    end

    def call
      content_tag(:div, content, **@options)
    end
  end
end
