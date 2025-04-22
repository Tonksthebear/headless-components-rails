module Headless
  class ListboxComponent < ApplicationComponent
    renders_one :button, ->(**button_options) {
    }

    renders_one :options_container, ->(**options_container_options) {
    }

    renders_many :options, ->(**option_options) {
    }

    renders_one :selected_option, ->(**selected_option_options) {
    }

    def initialize(**options)
      super(**options)
    end

    def before_render
      merge_options!({
        role: "listbox"
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
