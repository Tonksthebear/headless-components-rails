module Headless
  class FieldsetComponent < ApplicationComponent
    renders_many :fields, ->(**field_options, &block) {
      FieldComponent.new(render_controller: false, **field_options, &block)
    }

    renders_one :legend, ->(as: :div, **legend_options, &block) {
      legend_options[:id] ||= "#{@options[:id]}-legend"
      legend_options[:data] ||= {}
      legend_options[:data][:headless__form_target] = "legend"
      @legend_id = legend_options[:id]
      content_tag(as, **legend_options, &block)
    }

    def initialize(**options)
      options[:id] ||= "fieldset-#{object_id}"
      super(**options)
    end

    def before_render
      merge_options!({
        aria: {
          disabled: @options[:disabled] || nil,
          labelledby: @legend_id,
          describedby: class_names(fields.map(&:description_id))
        },
        data: {
          controller: "headless--form",
          headless__form_target: "fieldset",
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] || nil,
          focus: @options[:focus] || nil,
          autofocus: @options[:autofocus] || nil
        }
      })
    end

    def call
      content_tag(:fieldset, content, **@options)
    end
  end
end
