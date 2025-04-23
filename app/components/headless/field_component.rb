module Headless
  class FieldComponent < ApplicationComponent
    renders_one :label, ->(**label_options) {
      tag.label(**label_options)
    }

    renders_one :description, ->(**description_options) {
      DescriptionComponent.new(**description_options)
    }

    renders_one :input, ->(**input_options) {
      InputComponent.new(**input_options)
    }

    renders_one :textarea, ->(**textarea_options) {
      TextareaComponent.new(**textarea_options)
    }

    renders_one :select, ->(**select_options) {
      SelectComponent.new(**select_options)
    }


    def initialize(**options)
      super(**options)
    end

    def before_render
      merge_options!({
        aria: {
          disabled: @options[:disabled] || nil
        },
        data: {
          disabled: @options[:disabled] || nil,
          invalid: @options[:invalid] || nil,
          focus: @options[:focus] || nil,
          autofocus: @options[:autofocus] || nil
        }
      })
    end

    def call
      tag.input(**@options)
    end
  end
end
