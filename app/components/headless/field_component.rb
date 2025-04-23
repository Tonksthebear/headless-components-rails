module Headless
  class FieldComponent < ApplicationComponent
    attr_accessor :description_id

    renders_one :label, ->(**label_options, &block) {
      label_options[:id] ||= "#{@options[:id]}-label"
      label_options[:data] ||= {}
      label_options[:data][:headless__form_target] = "label"
      Headless::LabelComponent.new(**label_options, &block)
    }

    renders_one :description, ->(as: :p, **description_options, &block) {
      description_options[:id] ||= "#{@options[:id]}-description"
      description_options[:data] ||= {}
      description_options[:data][:headless__form_target] = "description"
      content_tag(as, **description_options, &block)
    }

    renders_one :input, ->(**input_options, &block) {
      input_options[:id] ||= "#{@options[:id]}-input"
      input_options[:data] ||= {}
      input_options[:data][:headless__form_target] = "input"
      InputComponent.new(**input_options, &block)
    }

    renders_one :textarea, ->(**textarea_options, &block) {
      textarea_options[:id] ||= "#{@options[:id]}-input"
      textarea_options[:data] ||= {}
      textarea_options[:data][:headless__form_target] = "input"
      TextareaComponent.new(**textarea_options, &block)
    }

    renders_one :select, ->(**select_options, &block) {
      select_options[:id] ||= "#{@options[:id]}-input"
      select_options[:data] ||= {}
      select_options[:data][:headless__form_target] = "input"
      SelectComponent.new(**select_options, &block)
    }

    renders_one :checkbox, ->(**checkbox_options, &block) {
      checkbox_options[:id] ||= "#{@options[:id]}-input"
      checkbox_options[:data] ||= {}
      checkbox_options[:data][:headless__form_target] = "input"
      CheckboxComponent.new(**checkbox_options, &block)
    }

    renders_one :radio_group, ->(**radio_group_options, &block) {
      radio_group_options[:id] ||= "#{@options[:id]}-input"
      radio_group_options[:data] ||= {}
      radio_group_options[:data][:headless__form_target] = "input"
      Radio::GroupComponent.new(**radio_group_options, &block)
    }

    renders_one :switch, ->(**switch_options, &block) {
      switch_options[:id] ||= "#{@options[:id]}-input"
      switch_options[:data] ||= {}
      switch_options[:data][:headless__form_target] = "input"
      SwitchComponent.new(**switch_options, &block)
    }

    def initialize(as: :div, render_controller: true, **options)
      @as = as
      options[:id] ||= "field-#{object_id}"
      @input_id = ""
      super(**options)
    end

    def input_component
      input || textarea || select || checkbox || radio_group || switch
    end

    def single_input?
    end

    def before_render
      # preload_procs
      merge_options!({
        aria: {
          disabled: @options[:disabled] || nil
        },
        data: {
          controller: @render_controller ? "headless--form" : nil,
          headless__form_target: "field",
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] || nil,
          focus: @options[:focus] || nil,
          autofocus: @options[:autofocus] || nil
        }
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
