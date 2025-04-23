module Headless
  class FieldsetComponent < ApplicationComponent
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
